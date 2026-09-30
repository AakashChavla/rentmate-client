import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";
import { AuthProvider } from "@/components/providers/auth-provider";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

const owner = {
  user: {
    id: "user_1",
    email: "demo@rentmate.local",
    fullName: "Demo Owner",
    status: "ACTIVE",
    organizationId: "org_1",
  },
  organization: {
    id: "org_1",
    name: "Demo Residences",
    slug: "demo",
    timezone: "Asia/Kolkata",
    plan: "starter",
  },
  roles: [{ key: "ORG_OWNER", scopeType: "ORGANIZATION", scopeId: "org_1" }],
  permissions: ["user:read"],
  isPlatformAdmin: false,
};

const server = setupServer(
  http.get("http://localhost:3000/api/v1/auth/me", () =>
    HttpResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    ),
  ),
  http.post("http://localhost:3000/api/v1/auth/refresh", () =>
    HttpResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    ),
  ),
);

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  }
  return render(<LoginForm />, { wrapper: Wrapper });
}

async function submit(email: string, password: string) {
  const user = userEvent.setup();
  renderForm();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginForm", () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    replaceMock.mockReset();
    window.history.pushState({}, "", "/login");
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("requires an email and a password", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("rejects an invalid email", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
  });

  it.each([
    ["INVALID_CREDENTIALS", {}, "Those credentials don’t match our records."],
    ["ACCOUNT_SUSPENDED", {}, "This account is suspended. Contact your workspace admin."],
    ["RATE_LIMITED", {}, "Too many attempts. Wait a moment and try again."],
  ] as const)("maps %s", async (code, details, message) => {
    server.use(
      http.post("http://localhost:3000/api/v1/auth/login", () =>
        HttpResponse.json(
          { success: false, error: { code, message: "nope", details } },
          { status: 401 },
        ),
      ),
    );
    await submit("demo@rentmate.local", "DemoUser12345");
    expect(await screen.findByText(message)).toBeInTheDocument();
  });

  it("shows a live countdown for ACCOUNT_LOCKED", async () => {
    server.use(
      http.post("http://localhost:3000/api/v1/auth/login", () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: "ACCOUNT_LOCKED",
              message: "Locked",
              details: { retryAfterSeconds: 30 },
            },
          },
          { status: 423 },
        ),
      ),
    );
    await submit("demo@rentmate.local", "DemoUser12345");
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("This account is locked. Try again in 30 seconds.");
  });

  it("rejects an unsafe next param and sends the owner home", async () => {
    window.history.pushState({}, "", "/login?next=https://evil.com");
    server.use(
      http.post("http://localhost:3000/api/v1/auth/login", () =>
        HttpResponse.json({ success: true, data: owner, meta: {} }),
      ),
      http.get("http://localhost:3000/api/v1/auth/me", () =>
        HttpResponse.json({ success: true, data: owner, meta: {} }),
      ),
    );
    await submit("demo@rentmate.local", "DemoUser12345");
    expect(replaceMock).toHaveBeenCalledWith("/admin/dashboard");
  });

  it("follows a safe relative next path", async () => {
    window.history.pushState({}, "", "/login?next=%2Fadmin%2Fsettings%2Fusers");
    server.use(
      http.post("http://localhost:3000/api/v1/auth/login", () =>
        HttpResponse.json({ success: true, data: owner, meta: {} }),
      ),
      http.get("http://localhost:3000/api/v1/auth/me", () =>
        HttpResponse.json({ success: true, data: owner, meta: {} }),
      ),
    );
    await submit("demo@rentmate.local", "DemoUser12345");
    expect(replaceMock).toHaveBeenCalledWith("/admin/settings/users");
  });
});

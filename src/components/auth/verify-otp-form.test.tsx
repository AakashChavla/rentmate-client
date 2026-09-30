import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { VerifyOtpForm } from "@/components/auth/verify-otp-form";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => "/verify-otp",
  useSearchParams: () => new URLSearchParams("email=tenant@rentmate.local"),
}));

const tenant = {
  user: {
    id: "user_2",
    email: "tenant@rentmate.local",
    fullName: "Demo Tenant",
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
  roles: [{ key: "TENANT", scopeType: "ORGANIZATION", scopeId: "org_1" }],
  permissions: ["lease:read"],
  isPlatformAdmin: false,
};

const server = setupServer();

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return render(<VerifyOtpForm />, { wrapper: Wrapper });
}

describe("VerifyOtpForm", () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    replaceMock.mockReset();
    window.history.pushState({}, "", "/verify-otp?email=tenant@rentmate.local");
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("submits when the sixth digit is entered and sends a tenant home", async () => {
    server.use(
      http.post("http://localhost:3000/api/v1/auth/otp/verify", async ({ request }) => {
        const body = (await request.json()) as { code: string };
        expect(body.code).toBe("123456");
        return HttpResponse.json({ success: true, data: tenant, meta: {} });
      }),
    );
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByRole("textbox"), "123456");
    expect(replaceMock).toHaveBeenCalledWith("/tenant/dashboard");
  });

  it("shows OTP_INVALID without revealing whether the email exists", async () => {
    server.use(
      http.post("http://localhost:3000/api/v1/auth/otp/verify", () =>
        HttpResponse.json(
          { success: false, error: { code: "OTP_INVALID", message: "Invalid" } },
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderForm();
    expect(
      screen.getByText("If that email is registered, a code has been sent."),
    ).toBeInTheDocument();
    await user.type(screen.getByRole("textbox"), "000000");
    expect(await screen.findByRole("alert")).toHaveTextContent("That code is not valid.");
  });
});

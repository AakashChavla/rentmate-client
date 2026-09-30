import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_API_ORIGIN: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

const serverSchema = z.object({
  API_OPENAPI_URL: z.string().url().optional(),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_ORIGIN: process.env.NEXT_PUBLIC_API_ORIGIN,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!clientParsed.success) {
  throw new Error(
    `Invalid environment variables:\n${formatIssues(clientParsed.error)}\nCopy .env.example to .env.local and fill in the values.`,
  );
}

let apiOpenApiUrl: string | undefined;

if (typeof window === "undefined") {
  const serverParsed = serverSchema.safeParse({
    API_OPENAPI_URL: process.env.API_OPENAPI_URL,
  });

  if (!serverParsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatIssues(serverParsed.error)}`,
    );
  }

  apiOpenApiUrl = serverParsed.data.API_OPENAPI_URL;
}

export const env = {
  NEXT_PUBLIC_API_URL: clientParsed.data.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_ORIGIN: clientParsed.data.NEXT_PUBLIC_API_ORIGIN,
  NEXT_PUBLIC_APP_NAME: clientParsed.data.NEXT_PUBLIC_APP_NAME,
  API_OPENAPI_URL: apiOpenApiUrl,
};

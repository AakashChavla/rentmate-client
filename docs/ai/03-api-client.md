# API client conventions
Use a typed credentials-included fetch wrapper. Keep tokens out of JavaScript and browser storage. Refresh once with a single shared promise across parallel 401 responses. Do not refresh authentication endpoints. Generate schema.d.ts from the server OpenAPI document. Preserve envelope/page metadata and request IDs.

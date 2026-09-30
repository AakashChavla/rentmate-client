/**
 * httpOnly session cookie set by rentmate-server.
 * Keep this name aligned with the server's Set-Cookie.
 * Never store access or refresh tokens in localStorage or sessionStorage.
 */
export const AUTH_COOKIE_NAME = "rm_session";

export const LOGIN_PATH = "/login";

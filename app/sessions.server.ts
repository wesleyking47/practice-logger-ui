import { createCookieSessionStorage } from "react-router";

interface SessionData {
  token: string;
}

interface SessionFlashData {
  message: string;
}

const sessionSecret = process.env.SESSION_SECRET ?? "dev-secret-change-me";
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set");
}

const sessionStorage = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

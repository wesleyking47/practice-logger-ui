import { getSession } from "~/sessions.server";

export async function getToken(request: Request): Promise<string | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  return typeof token === "string" ? token : null;
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getUserFromToken(token: string): { id: string; username: string } | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const idValue =
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
    payload.nameid;
  const nameValue =
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
    payload.unique_name;

  const id = typeof idValue === "string" || typeof idValue === "number" ? String(idValue) : null;
  const username = typeof nameValue === "string" ? nameValue : null;

  if (!id || !username) {
    return null;
  }

  return { id, username };
}

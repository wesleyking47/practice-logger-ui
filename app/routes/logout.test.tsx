import { action } from "~/routes/logout";
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  commitSession: vi.fn(),
}));

vi.mock("~/sessions.server", () => ({
  getSession: mocks.getSession,
  commitSession: mocks.commitSession,
}));

afterEach(() => {
  vi.clearAllMocks();
});

test("logout clears token and redirects", async () => {
  const session = {
    unset: vi.fn(),
    flash: vi.fn(),
  };

  mocks.getSession.mockResolvedValue(session);
  mocks.commitSession.mockResolvedValue("session=cleared");

  const request = new Request("http://localhost/logout", { method: "POST" });
  const response = await action({ request } as never);

  expect(session.unset).toHaveBeenCalledWith("token");
  expect(session.flash).toHaveBeenCalledWith("message", "You've been signed out.");
  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBe("/login");
  expect(response.headers.get("Set-Cookie")).toBe("session=cleared");
});

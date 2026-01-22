import { http, HttpResponse } from "msw";
import { PracticeSessionService } from "~/services/practice-session";
import { server } from "~/test/server";

const API_BASE_URL = "http://localhost:5270";

const session = {
  id: "1",
  activity: "Guitar",
  date: "2024-01-01",
  notes: "Scales",
  minutes: 30,
};

test("getAll returns sessions", async () => {
  server.use(
    http.get(`${API_BASE_URL}/sessions`, () =>
      HttpResponse.json({ sessions: [session] })
    )
  );

  const result = await PracticeSessionService.getAll();

  expect(result.sessions).toEqual([session]);
});

test("getAll throws on failure", async () => {
  server.use(
    http.get(`${API_BASE_URL}/sessions`, () => new HttpResponse(null, { status: 500 }))
  );

  await expect(PracticeSessionService.getAll()).rejects.toThrow(
    "Failed to fetch sessions"
  );
});

test("create posts a session", async () => {
  let received: unknown = null;

  server.use(
    http.post(`${API_BASE_URL}/sessions`, async ({ request }) => {
      received = await request.json();
      return HttpResponse.json({ ...session, id: "2" });
    })
  );

  const created = await PracticeSessionService.create({
    activity: session.activity,
    date: session.date,
    notes: session.notes,
    minutes: session.minutes,
  });

  expect(received).toEqual({
    activity: session.activity,
    date: session.date,
    notes: session.notes,
    minutes: session.minutes,
  });
  expect(created.id).toBe("2");
});

test("update sends a session payload", async () => {
  let received: unknown = null;

  server.use(
    http.put(`${API_BASE_URL}/sessions/${session.id}`, async ({ request }) => {
      received = await request.json();
      return new HttpResponse(null, { status: 204 });
    })
  );

  await PracticeSessionService.update(session);

  expect(received).toEqual(session);
});

test("delete sends a delete request", async () => {
  let hit = false;

  server.use(
    http.delete(`${API_BASE_URL}/sessions/${session.id}`, () => {
      hit = true;
      return new HttpResponse(null, { status: 204 });
    })
  );

  await PracticeSessionService.delete(Number(session.id));

  expect(hit).toBe(true);
});

import { action, loader } from "~/routes/home";
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("~/services/practice-session", () => ({
  PracticeSessionService: {
    getAll: mocks.getAll,
    create: mocks.create,
    update: mocks.update,
    delete: mocks.remove,
  },
}));

const mockSession = {
  id: "1",
  activity: "Guitar",
  date: "2024-01-01",
  notes: "Scales",
  minutes: 30,
};

afterEach(() => {
  vi.clearAllMocks();
});

test("loader returns sessions", async () => {
  mocks.getAll.mockResolvedValue({ sessions: [mockSession] });

  const result = await loader();

  expect(mocks.getAll).toHaveBeenCalledTimes(1);
  expect(result).toEqual({ sessions: [mockSession] });
});

test("action deletes when intent is delete", async () => {
  const formData = new URLSearchParams();
  formData.set("intent", "delete");
  formData.set("id", "2");

  const request = new Request("http://localhost", {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  await action({ request } as never);

  expect(mocks.remove).toHaveBeenCalledWith(2);
});

test("action updates when intent is update", async () => {
  const formData = new URLSearchParams();
  formData.set("intent", "update");
  formData.set("id", "3");
  formData.set("activity", "Piano");
  formData.set("date", "2024-02-01");
  formData.set("notes", "Arpeggios");
  formData.set("minutes", "45");

  const request = new Request("http://localhost", {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  await action({ request } as never);

  expect(mocks.update).toHaveBeenCalledWith({
    id: "3",
    activity: "Piano",
    date: "2024-02-01",
    notes: "Arpeggios",
    minutes: 45,
  });
});

test("action creates when intent is missing", async () => {
  const formData = new URLSearchParams();
  formData.set("activity", "Drums");
  formData.set("date", "2024-03-01");
  formData.set("notes", "Grooves");
  formData.set("minutes", "20");

  const request = new Request("http://localhost", {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  await action({ request } as never);

  expect(mocks.create).toHaveBeenCalledWith({
    activity: "Drums",
    date: "2024-03-01",
    notes: "Grooves",
    minutes: 20,
  });
});

import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE_URL = process.env.VITE_API_URL ?? "http://localhost:5270";
const UI_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

interface AuthState {
  username: string;
  password: string;
  token: string;
}

interface SessionSummary {
  id: number;
  activity: string;
}

interface SessionsResponse {
  sessions: SessionSummary[];
}

function isSessionsResponse(value: unknown): value is SessionsResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const sessions = (value as { sessions?: unknown }).sessions;
  if (!Array.isArray(sessions)) {
    return false;
  }

  return sessions.every(
    (session) =>
      Boolean(session) &&
      typeof session === "object" &&
      typeof (session as { id?: unknown }).id === "number" &&
      typeof (session as { activity?: unknown }).activity === "string"
  );
}

async function cleanupSessions(
  request: APIRequestContext,
  activities: string[],
  token: string
) {
  if (activities.length === 0) {
    return;
  }

  const response = await request.get(`${API_BASE_URL}/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok()) {
    return;
  }

  const data = (await response.json()) as unknown;
  if (!isSessionsResponse(data)) {
    return;
  }

  const sessions = data.sessions;
  const matches = sessions.filter((session) => activities.includes(session.activity));

  await Promise.all(
    matches.map((session) =>
      request.delete(`${API_BASE_URL}/sessions/${session.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function uniqueActivity(label: string) {
  const nonce = Math.random().toString(36).slice(2, 8);
  return `${label} ${Date.now()}-${nonce}`;
}

function uniqueUsername(workerIndex: number) {
  const nonce = Math.random().toString(36).slice(2, 6);
  return `e2e_user_${workerIndex}_${Date.now()}_${nonce}`;
}

async function registerUser(
  request: APIRequestContext,
  username: string,
  password: string
) {
  const response = await request.post(`${API_BASE_URL}/api/auth/register`, {
    data: { username, password },
  });

  if (!response.ok()) {
    const body = await response.text();
    const status = response.status();
    throw new Error(`Failed to register user: ${status} ${body}`);
  }
}

async function loginApi(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
    data: { username, password },
  });

  if (!response.ok()) {
    const body = await response.text();
    const status = response.status();
    throw new Error(`Failed to login via API: ${status} ${body}`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error("Login API response missing token.");
  }

  return data.token;
}

async function loginUi(page: Page, username: string, password: string) {
  await page.goto(`${UI_BASE_URL}/login`);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "Practice Logger" })).toBeVisible();
}

const test = base.extend<{ auth: AuthState }>({
  auth: async ({ page, request }, provide, testInfo) => {
    const username = uniqueUsername(testInfo.workerIndex);
    const password = "E2E_Test_Pass_123!";
    await registerUser(request, username, password);
    const token = await loginApi(request, username, password);
    await loginUi(page, username, password);
    await provide({ username, password, token });
  },
});

test("creates a practice session", async ({ page, request, auth }) => {
  const activity = uniqueActivity("E2E Session");
  const createdActivities = [activity];

  try {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Practice Logger" })
    ).toBeVisible();

    await page.getByRole("button", { name: "New Session" }).click();
    const addDialog = page.getByRole("dialog", {
      name: "Add Practice Session",
    });
    await page.getByLabel("Activity").fill(activity);
    await page.getByLabel("Date").fill(formatDate(new Date()));
    await page.getByLabel("Duration (minutes)").fill("15");
    await page.getByLabel("Notes").fill("E2E test session");
    await page.getByRole("button", { name: "Save Session" }).click();
    await expect(addDialog).toBeHidden();
    const cardTitle = page.locator('[data-slot="card-title"]', {
      hasText: activity,
    });
    await expect(cardTitle).toHaveCount(1, { timeout: 10000 });
  } finally {
    await cleanupSessions(request, createdActivities, auth.token);
  }
});

test("edits a practice session", async ({ page, request, auth }) => {
  const activity = uniqueActivity("E2E Session");
  const updatedActivity = `${activity} Updated`;
  const createdActivities = [activity, updatedActivity];

  try {
    await page.goto("/");
    await page.getByRole("button", { name: "New Session" }).click();
    const addDialog = page.getByRole("dialog", {
      name: "Add Practice Session",
    });
    await page.getByLabel("Activity").fill(activity);
    await page.getByLabel("Date").fill(formatDate(new Date()));
    await page.getByLabel("Duration (minutes)").fill("20");
    await page.getByLabel("Notes").fill("E2E edit test session");
    await page.getByRole("button", { name: "Save Session" }).click();
    await expect(addDialog).toBeHidden();

    const card = page
      .locator('[data-slot="card"]', { hasText: activity })
      .first();
    await card.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    const editDialog = page.getByRole("dialog", {
      name: "Edit Practice Session",
    });
    await editDialog.getByLabel("Activity").fill(updatedActivity);
    await editDialog.getByLabel("Duration (minutes)").fill("25");
    await editDialog.getByRole("button", { name: "Update Session" }).click();
    await expect(editDialog).toBeHidden();
    const updatedTitle = page.locator('[data-slot="card-title"]', {
      hasText: updatedActivity,
    });
    await expect(updatedTitle).toHaveCount(1, { timeout: 10000 });
  } finally {
    await cleanupSessions(request, createdActivities, auth.token);
  }
});

test("deletes a practice session", async ({ page, request, auth }) => {
  const activity = uniqueActivity("E2E Session");
  const createdActivities = [activity];

  try {
    await page.goto("/");
    await page.getByRole("button", { name: "New Session" }).click();
    const addDialog = page.getByRole("dialog", {
      name: "Add Practice Session",
    });
    await page.getByLabel("Activity").fill(activity);
    await page.getByLabel("Date").fill(formatDate(new Date()));
    await page.getByLabel("Duration (minutes)").fill("10");
    await page.getByLabel("Notes").fill("E2E delete test session");
    await page.getByRole("button", { name: "Save Session" }).click();
    await expect(addDialog).toBeHidden();

    const card = page
      .locator('[data-slot="card"]', { hasText: activity })
      .first();
    await card.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(card).toHaveCount(0, { timeout: 10000 });
  } finally {
    await cleanupSessions(request, createdActivities, auth.token);
  }
});

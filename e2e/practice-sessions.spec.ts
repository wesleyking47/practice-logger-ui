import { expect, test, type APIRequestContext } from "@playwright/test";

const API_BASE_URL = process.env.VITE_API_URL ?? "http://localhost:5270";

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

async function cleanupSessions(request: APIRequestContext, activities: string[]) {
  if (activities.length === 0) {
    return;
  }

  const response = await request.get(`${API_BASE_URL}/sessions`);
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
    matches.map((session) => request.delete(`${API_BASE_URL}/sessions/${session.id}`))
  );
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function uniqueActivity(label: string) {
  return `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

test("creates a practice session", async ({ page, request }) => {
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
    await cleanupSessions(request, createdActivities);
  }
});

test("edits a practice session", async ({ page, request }) => {
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
    await cleanupSessions(request, createdActivities);
  }
});

test("deletes a practice session", async ({ page, request }) => {
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
    await cleanupSessions(request, createdActivities);
  }
});

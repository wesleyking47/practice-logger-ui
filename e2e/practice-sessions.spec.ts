import { expect, test } from "@playwright/test";

const API_BASE_URL = process.env.VITE_API_URL ?? "http://localhost:5270";

async function cleanupSessions(request: typeof test.request, activities: string[]) {
  if (activities.length === 0) {
    return;
  }

  const response = await request.get(`${API_BASE_URL}/sessions`);
  if (!response.ok()) {
    return;
  }

  const data = (await response.json()) as { sessions?: Array<{ id: number; activity: string }> };
  const sessions = data.sessions ?? [];
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

test("creates a practice session", async ({ page, request }) => {
  const activity = `E2E Session ${Date.now()}`;
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
    await expect(page.getByText(activity)).toBeVisible({ timeout: 10000 });
  } finally {
    await cleanupSessions(request, createdActivities);
  }
});

test("edits a practice session", async ({ page, request }) => {
  const activity = `E2E Session ${Date.now()}`;
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

    const card = page.locator('[data-slot="card"]', { hasText: activity });
    await card.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    const editDialog = page.getByRole("dialog", {
      name: "Edit Practice Session",
    });
    await editDialog.getByLabel("Activity").fill(updatedActivity);
    await editDialog.getByLabel("Duration (minutes)").fill("25");
    await editDialog.getByRole("button", { name: "Update Session" }).click();
    await expect(editDialog).toBeHidden();
    await expect(page.getByText(updatedActivity)).toBeVisible({ timeout: 10000 });
  } finally {
    await cleanupSessions(request, createdActivities);
  }
});

test("deletes a practice session", async ({ page, request }) => {
  const activity = `E2E Session ${Date.now()}`;
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

    const card = page.locator('[data-slot="card"]', { hasText: activity });
    await card.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(card).toHaveCount(0, { timeout: 10000 });
  } finally {
    await cleanupSessions(request, createdActivities);
  }
});

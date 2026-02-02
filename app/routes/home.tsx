import { redirect } from "react-router";
import type { Route } from "./+types/home";
import { SessionList } from "~/sessions-list/sessions-list";
import { PracticeSessionService } from "~/services/practice-session";
import { getToken } from "~/auth.server";
import { destroySession, getSession } from "~/sessions.server";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: { request: Request }) {
  const token = await getToken(request);
  if (!token) {
    return redirect("/login");
  }

  try {
    const response = await PracticeSessionService.getAll(token);
    return { sessions: response.sessions };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      const session = await getSession(request.headers.get("Cookie"));
      return redirect("/login", {
        headers: { "Set-Cookie": await destroySession(session) },
      });
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to load sessions.");
  }
}

export async function action({ request }: { request: Request }) {
  const token = await getToken(request);
  if (!token) {
    return redirect("/login");
  }
  const formData = await request.formData();
  const intentValue = formData.get("intent");
  const intent = typeof intentValue === "string" ? intentValue : "create";

  if (intent === "delete") {
    const idValue = formData.get("id");
    const id = Number(typeof idValue === "string" ? idValue : "");
    await PracticeSessionService.delete(id, token);
    return null;
  }

  if (intent === "update") {
    const idValue = formData.get("id");
    const activityValue = formData.get("activity");
    const dateValue = formData.get("date");
    const notesValue = formData.get("notes");
    const minutesValue = formData.get("minutes");

    const id = typeof idValue === "string" ? idValue : "";
    const activity = typeof activityValue === "string" ? activityValue : "";
    const date = typeof dateValue === "string" ? dateValue : "";
    const notes = typeof notesValue === "string" ? notesValue : "";
    const minutes = Number(typeof minutesValue === "string" ? minutesValue : "");

    await PracticeSessionService.update(
      {
        id,
        activity,
        date,
        notes,
        minutes,
      },
      token
    );

    return null;
  }

  const activityValue = formData.get("activity");
  const dateValue = formData.get("date");
  const notesValue = formData.get("notes");
  const minutesValue = formData.get("minutes");

  const activity = typeof activityValue === "string" ? activityValue : "";
  const date = typeof dateValue === "string" ? dateValue : "";
  const notes = typeof notesValue === "string" ? notesValue : "";
  const minutes = Number(typeof minutesValue === "string" ? minutesValue : "");

  await PracticeSessionService.create(
    {
      activity,
      date,
      notes,
      minutes,
    },
    token
  );

  return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <SessionList sessions={loaderData.sessions} />;
}

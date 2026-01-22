import type { Route } from "./+types/home";
import { SessionList } from "~/sessions-list/sessions-list";
import { PracticeSessionService } from "~/services/practice-session";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const response = await PracticeSessionService.getAll();
  return { sessions: response.sessions };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intentValue = formData.get("intent");
  const intent = typeof intentValue === "string" ? intentValue : "create";

  if (intent === "delete") {
    const idValue = formData.get("id");
    const id = Number(typeof idValue === "string" ? idValue : "");
    await PracticeSessionService.delete(id);
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

    await PracticeSessionService.update({
      id,
      activity,
      date,
      notes,
      minutes,
    });

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

  await PracticeSessionService.create({
    activity,
    date,
    notes,
    minutes,
  });

  return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <SessionList sessions={loaderData.sessions} />;
}

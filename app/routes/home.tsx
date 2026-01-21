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
  const intent = formData.get("intent") ?? "create";

  if (intent === "delete") {
    const id = Number(formData.get("id"));
    await PracticeSessionService.delete(id);
    return null;
  }

  if (intent === "update") {
    const id = formData.get("id") as string;
    const activity = formData.get("activity") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;
    const minutes = Number(formData.get("minutes"));

    await PracticeSessionService.update({
      id,
      activity,
      date,
      notes,
      minutes,
    });

    return null;
  }

  const activity = formData.get("activity") as string;
  const date = formData.get("date") as string;
  const notes = formData.get("notes") as string;
  const minutes = Number(formData.get("minutes"));

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

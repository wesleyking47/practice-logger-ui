import type { Route } from "./+types/home";
import { SessionList } from "~/sessions-list/sessions-list";
import { PracticeSessionService } from "~/services/practice-session";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  const response = await PracticeSessionService.getAll();
  return { sessions: response.sessions };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <SessionList sessions={loaderData.sessions} />;
}

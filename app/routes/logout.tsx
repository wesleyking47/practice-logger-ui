import { redirect } from "react-router";
import { commitSession, getSession } from "~/sessions.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  session.unset("token");
  session.flash("message", "You've been signed out.");

  return redirect("/login", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Logout() {
  return null;
}

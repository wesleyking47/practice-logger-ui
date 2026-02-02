import { Link, Form, data, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { commitSession, getSession } from "~/sessions.server";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("token")) {
    return redirect("/");
  }

  const message = session.get("message");
  return data(
    { message: typeof message === "string" ? message : null },
    { headers: { "Set-Cookie": await commitSession(session) } }
  );
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return data({ error: "Username and password are required." }, { status: 400 });
  }

  const apiBaseUrl = process.env.VITE_API_URL ?? "http://localhost:5270";
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    return data({ error: "Login failed." }, { status: response.status });
  }

  const result = (await response.json()) as { token?: string };
  if (!result.token) {
    return data({ error: "Login failed." }, { status: 500 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("token", result.token);

  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your practice log
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loaderData?.message && (
            <div className="mb-4 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              {loaderData.message}
            </div>
          )}
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="johndoe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {actionData?.error && (
              <div className="text-red-500 text-sm font-medium">{actionData.error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Sign In"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="ml-1 text-primary hover:underline font-medium">
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

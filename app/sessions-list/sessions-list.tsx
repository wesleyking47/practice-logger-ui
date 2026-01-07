import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { PracticeSession } from "~/services/practice-session";
import { useState } from "react";

export function SessionList({ sessions }: { sessions: PracticeSession[] }) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-balance my-5">
        Practice Logger
      </h1>
      <div className="flex gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{session.activity}</CardTitle>
              <CardDescription>{session.date}</CardDescription>
              <CardAction>Delete</CardAction>
            </CardHeader>
            <CardContent>{session.notes}</CardContent>
            <CardFooter>{session.minutes} minutes</CardFooter>
          </Card>
        ))}
        {isAdding ? (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle></CardTitle>
              <CardDescription></CardDescription>
              <CardAction>Add</CardAction>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter> minutes</CardFooter>
          </Card>
        ) : (
          <Button onClick={() => setIsAdding(true)}>Add</Button>
        )}
      </div>
    </div>
  );
}

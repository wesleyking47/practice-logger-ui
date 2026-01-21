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
import { useFetcher } from "react-router";
import { Field, FieldGroup, FieldLabel, FieldSet } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export function SessionList({ sessions }: { sessions: PracticeSession[] }) {
  const [isAdding, setIsAdding] = useState(false);

  const fetcher = useFetcher();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-balance my-5">
        Practice Logger
      </h1>
      <div className="flex gap-4 items-start flex-wrap">
        {sessions.map((session) => (
          <Card key={session.id} className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>{session.activity}</CardTitle>
              <CardDescription>{session.date}</CardDescription>
              <CardAction>
                <Button variant="outline">Delete</Button>
              </CardAction>
            </CardHeader>
            <CardContent>{session.notes}</CardContent>
            <CardFooter>{session.minutes} minutes</CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-2">
        {isAdding ? (
          <div className="w-full max-w-sm">
            <fetcher.Form method="post">
              <FieldGroup>
                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="activity">Activity</FieldLabel>
                      <Input id="activity" name="activity" type="text" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="notes">Notes</FieldLabel>
                      <Input id="notes" name="notes" type="text" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="minutes">Minutes</FieldLabel>
                      <Input id="minutes" name="minutes" type="number" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="date">Date</FieldLabel>
                      <Input id="date" name="date" type="date" />
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <Field>
                  <Button type="submit">Submit</Button>
                </Field>
                <Button onClick={() => setIsAdding(false)} variant="outline">
                  Cancel
                </Button>
              </FieldGroup>
            </fetcher.Form>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)}>Add</Button>
        )}
      </div>
    </div>
  );
}

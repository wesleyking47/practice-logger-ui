import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { PracticeSession } from "~/services/practice-session";
import { useEffect, useRef, useState } from "react";
import { Form, useFetcher } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { EmptyState } from "~/components/empty-state";
import { MoreHorizontal, Plus } from "lucide-react";

export function SessionList({ sessions }: { sessions: PracticeSession[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<PracticeSession | null>(null);

  const deleteFetcher = useFetcher();
  const addFetcher = useFetcher();
  const editFetcher = useFetcher();
  const wasAdding = useRef(false);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (addFetcher.state === "submitting") {
      wasAdding.current = true;
    }
    if (addFetcher.state === "idle" && wasAdding.current) {
      setTimeout(() => setIsAdding(false));
      wasAdding.current = false;
    }
  }, [addFetcher.state]);

  useEffect(() => {
    if (editFetcher.state === "submitting") {
      wasEditing.current = true;
    }
    if (editFetcher.state === "idle" && wasEditing.current) {
      setTimeout(() => setSessionToEdit(null));
      wasEditing.current = false;
    }
  }, [editFetcher.state]);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Practice Logger</h1>
        <div className="flex items-center gap-3">
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Practice Session</DialogTitle>
              </DialogHeader>
              <addFetcher.Form method="post" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="activity">Activity</Label>
                    <Input
                      id="activity"
                      name="activity"
                      placeholder="e.g. Guitar"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="minutes">Duration (minutes)</Label>
                    <Input
                      id="minutes"
                      name="minutes"
                      type="number"
                      min="1"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="What did you practice?"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Session</Button>
                </DialogFooter>
              </addFetcher.Form>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Account</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Form method="post" action="/logout">
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full text-left">
                    Sign out
                  </button>
                </DropdownMenuItem>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState onAdd={() => setIsAdding(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between space-x-2">
                  <CardTitle className="text-lg font-medium">
                    {session.activity}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSessionToEdit(session)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setSessionToDelete(Number(session.id))}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{session.date}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-balance leading-relaxed">
                  {session.notes}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-muted/5">
                <div className="text-sm font-medium text-muted-foreground flex items-center">
                  <span className="font-semibold text-foreground mr-1">
                    {session.minutes}
                  </span>
                  minutes
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={sessionToEdit !== null} onOpenChange={(open) => !open && setSessionToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Practice Session</DialogTitle>
          </DialogHeader>
          {sessionToEdit && (
            <editFetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={sessionToEdit.id} />
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-activity">Activity</Label>
                  <Input
                    id="edit-activity"
                    name="activity"
                    placeholder="e.g. Guitar"
                    defaultValue={sessionToEdit.activity}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    defaultValue={sessionToEdit.date}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-minutes">Duration (minutes)</Label>
                  <Input
                    id="edit-minutes"
                    name="minutes"
                    type="number"
                    min="1"
                    defaultValue={sessionToEdit.minutes}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Input
                    id="edit-notes"
                    name="notes"
                    placeholder="What did you practice?"
                    defaultValue={sessionToEdit.notes}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSessionToEdit(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Session</Button>
              </DialogFooter>
            </editFetcher.Form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={sessionToDelete !== null}
        onOpenChange={(open) => !open && setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              practice session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (sessionToDelete !== null) {
                  void deleteFetcher.submit(
                    { intent: "delete", id: String(sessionToDelete) },
                    { method: "post" }
                  );
                  setSessionToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

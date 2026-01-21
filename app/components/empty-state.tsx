import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10 border-dashed h-96">
      <div className="max-w-md space-y-6 flex flex-col items-center">
        <div className="p-4 rounded-full bg-background border shadow-sm">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">
            No practice sessions logged
          </h3>
          <p className="text-sm text-muted-foreground">
            Start tracking your progress by adding your first practice session.
          </p>
        </div>
        <Button onClick={onAdd}>Add Practice Session</Button>
      </div>
    </div>
  );
}

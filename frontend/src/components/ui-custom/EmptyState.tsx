import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 w-full my-6">
      <div className="text-5xl md:text-6xl mb-4">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="min-h-[48px] py-3 px-6 rounded-xl w-full sm:w-auto font-medium shadow-md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

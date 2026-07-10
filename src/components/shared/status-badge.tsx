import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE } from "@/lib/selectors";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_BADGE[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium capitalize", config.className)}
    >
      {config.label}
    </Badge>
  );
}

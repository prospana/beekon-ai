import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface FilterBreadcrumbsProps {
  filters: {
    topic?: string;
    llm?: string;
    search?: string;
  };
  onRemoveFilter: (filterType: "topic" | "llm" | "search") => void;
  onClearAll: () => void;
  resultCount?: number;
}

export function FilterBreadcrumbs({
  filters,
  onRemoveFilter,
  onClearAll,
  resultCount,
}: FilterBreadcrumbsProps) {
  const hasFilters = Object.values(filters).some(Boolean);

  if (!hasFilters) {
    return null;
  }

  const filterItems = [];

  if (filters.topic) {
    filterItems.push({
      type: "topic" as const,
      label: `Topic: ${filters.topic}`,
      value: filters.topic,
    });
  }

  if (filters.llm) {
    filterItems.push({
      type: "llm" as const,
      label: `LLM: ${filters.llm}`,
      value: filters.llm,
    });
  }

  if (filters.search) {
    filterItems.push({
      type: "search" as const,
      label: `Search: "${filters.search}"`,
      value: filters.search,
    });
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">
        Active filters:
      </span>

      <div className="flex items-center gap-2 flex-wrap">
        {filterItems.map((item) => (
          <Badge
            key={item.type}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
          >
            <span className="text-xs">{item.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onRemoveFilter(item.type)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {resultCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({resultCount} result{resultCount !== 1 ? "s" : ""})
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onClearAll}
        className="ml-auto text-xs"
      >
        Clear all
      </Button>
    </div>
  );
}

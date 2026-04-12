import { Search } from "lucide-react";

interface SearchFilterProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchFilter({ value, onChange, placeholder = "Search..." }: SearchFilterProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
      />
    </div>
  );
}

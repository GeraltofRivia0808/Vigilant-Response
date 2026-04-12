import { Search } from "lucide-react";

interface SearchFilterProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchFilter({ value, onChange, placeholder = "Filter..." }: SearchFilterProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-[120px] rounded border border-border bg-secondary/50 py-1 pl-7 pr-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none transition-colors mono"
      />
    </div>
  );
}

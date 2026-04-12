export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="h-10 w-10 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
      </div>
      <span className="ml-3 text-sm text-muted-foreground">Loading data...</span>
    </div>
  );
}

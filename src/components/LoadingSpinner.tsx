export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative h-6 w-6">
        <div className="absolute inset-0 rounded-full border border-border" />
        <div className="absolute inset-0 rounded-full border border-transparent border-t-primary animate-spin" />
      </div>
      <span className="ml-2 text-xs text-muted-foreground mono">LOADING DATA...</span>
    </div>
  );
}

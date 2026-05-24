export default function LoadingState({ rows = 4 }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

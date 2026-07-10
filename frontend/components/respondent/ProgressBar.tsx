export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  return (
    <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-800 z-50">
      <div
        className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] relative">
      {/* flex-1 with min-h-0 ensures children can properly use h-full */}
      <main className="flex-1 min-h-0 overflow-hidden bg-[var(--bg)] flex flex-col">
        {children}
      </main>
    </div>
  );
}


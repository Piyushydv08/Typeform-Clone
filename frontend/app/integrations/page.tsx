import { ComingSoon } from "@/components/ui/ComingSoon";
import { GlobalNavbar } from "@/components/ui/GlobalNavbar";

export default function IntegrationsPage() {
  return (
    <div className="h-screen flex flex-col">
      <GlobalNavbar />
      <div className="flex-1 p-8" style={{ backgroundColor: "var(--bg)" }}>
        <div 
          className="max-w-4xl mx-auto h-full rounded-2xl border overflow-hidden"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <ComingSoon feature="Integrations" />
        </div>
      </div>
    </div>
  );
}

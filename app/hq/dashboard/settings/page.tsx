import TopBar from "@/components/hq/TopBar";
import NotificationSettings from "@/components/hq/settings/NotificationSettings";
import { HQ_TEXT } from "@/lib/hq-colors";

export const metadata = { title: "Settings — Island Investors HQ" };

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" subtitle="HQ configuration and preferences" />
      <main className="flex-1 p-6 space-y-6">

        <section>
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-wider mb-3"
            style={{ color: HQ_TEXT.helper }}
          >
            Notifications
          </h2>
          <div
            className="p-6"
            style={{ background: "rgba(8,22,40,0.55)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <NotificationSettings />
          </div>
        </section>

      </main>
    </>
  );
}

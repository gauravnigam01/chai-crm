import { useState } from "react";
import Entry from "./pages/Entry.jsx";
import DailyReport from "./pages/DailyReport.jsx";
import Bills from "./pages/Bills.jsx";
import People from "./pages/People.jsx";
import Items from "./pages/Items.jsx";
import Settings from "./pages/Settings.jsx";

const TABS = [
  { key: "entry", label: "☕ Entry", Page: Entry },
  { key: "daily", label: "📅 Daily Report", Page: DailyReport },
  { key: "bills", label: "🧾 Bills", Page: Bills },
  { key: "people", label: "👥 Customers", Page: People },
  { key: "items", label: "🍪 Items", Page: Items },
  { key: "settings", label: "⚙️ Settings", Page: Settings },
];

export default function App() {
  const [tab, setTab] = useState("entry");
  const { Page } = TABS.find((t) => t.key === tab);

  return (
    <div className="app">
      <header className="topbar">
        <h1>☕ Chai Tracker</h1>
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={t.key === tab ? "tab active" : "tab"} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="content">
        <Page goTo={setTab} />
      </main>
    </div>
  );
}

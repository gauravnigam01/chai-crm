import { useState } from "react";
import Entry from "./pages/Entry.jsx";
import Report from "./pages/Report.jsx";
import People from "./pages/People.jsx";
import Settings from "./pages/Settings.jsx";

const TABS = [
  { key: "entry", label: "☕ Chai likho", Page: Entry },
  { key: "report", label: "📒 Hisaab", Page: Report },
  { key: "people", label: "👥 Log", Page: People },
  { key: "settings", label: "⚙️ Settings", Page: Settings },
];

export default function App() {
  const [tab, setTab] = useState("entry");
  const { Page } = TABS.find((t) => t.key === tab);

  return (
    <div className="app">
      <header className="topbar">
        <h1>☕ Chai Hisaab</h1>
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

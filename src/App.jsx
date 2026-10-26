import { useState } from "react";
import Entry from "./pages/Entry.jsx";
import DailyReport from "./pages/DailyReport.jsx";
import Bills from "./pages/Bills.jsx";
import People from "./pages/People.jsx";
import Items from "./pages/Items.jsx";
import Settings from "./pages/Settings.jsx";
import CustomerBill from "./pages/CustomerBill.jsx";

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
  // When set, the customer's own bill is shown in place of the tab: { personId, range }
  const [bill, setBill] = useState(null);
  const { Page } = TABS.find((t) => t.key === tab);

  function goTo(key) {
    setBill(null);
    setTab(key);
  }

  return (
    <div className="app">
      <header className="topbar no-print">
        <h1>☕ Chai Tracker</h1>
      </header>
      <nav className="tabs no-print">
        {TABS.map((t) => (
          <button key={t.key} className={t.key === tab ? "tab active" : "tab"} onClick={() => goTo(t.key)}>
            {t.label}
          </button>
        ))}
      </nav>
      <main className="content">
        {bill ? (
          <CustomerBill
            key={bill.personId}
            personId={bill.personId}
            initialRange={bill.range}
            onBack={() => setBill(null)}
          />
        ) : (
          <Page goTo={goTo} openBill={(personId, range) => setBill({ personId, range })} />
        )}
      </main>
    </div>
  );
}

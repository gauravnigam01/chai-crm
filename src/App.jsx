import { useState } from "react";
import Entry from "./pages/Entry.jsx";
import DailyReport from "./pages/DailyReport.jsx";
import Bills from "./pages/Bills.jsx";
import People from "./pages/People.jsx";
import Items from "./pages/Items.jsx";
import Settings from "./pages/Settings.jsx";
import CustomerBill from "./pages/CustomerBill.jsx";
import { accountOf, rupees, useStore } from "./store.jsx";

const PAGES = [
  { key: "entry", icon: "☕", label: "Entry", subtitle: "Record what each customer took", Page: Entry },
  { key: "daily", icon: "📅", label: "Daily Report", subtitle: "Sales and payments for one day", Page: DailyReport },
  { key: "bills", icon: "🧾", label: "Bills", subtitle: "Customer bills, payments and balances", Page: Bills },
  { key: "people", icon: "👥", label: "Customers", subtitle: "Names, mobile numbers and addresses", Page: People },
  { key: "items", icon: "🍪", label: "Items", subtitle: "What you sell and the price", Page: Items },
  { key: "settings", icon: "⚙️", label: "Settings", subtitle: "Backup and data", Page: Settings },
];

export default function App() {
  const { people, entries, payments } = useStore();
  const [pageKey, setPageKey] = useState("entry");
  // When set, the customer's own bill is shown in place of the page: { personId, range }
  const [bill, setBill] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const page = PAGES.find((p) => p.key === pageKey);
  const { Page } = page;

  const toCollect = people.reduce((sum, p) => sum + Math.max(0, accountOf(p.id, entries, payments).balance), 0);

  function goTo(key) {
    setBill(null);
    setPageKey(key);
    setMenuOpen(false);
  }

  return (
    <div className={menuOpen ? "layout menu-open" : "layout"}>
      <aside className="sidebar no-print">
        <div className="brand">
          <span className="brand-icon">☕</span>
          <div>
            <strong>Chai Tracker</strong>
            <span>CRM</span>
          </div>
        </div>

        <nav className="nav">
          {PAGES.map((p) => (
            <button key={p.key} className={p.key === pageKey ? "nav-item active" : "nav-item"} onClick={() => goTo(p.key)}>
              <span className="nav-icon">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <span>To collect</span>
          <strong>{rupees(toCollect)}</strong>
          <button className="link light" onClick={() => goTo("bills")}>
            View bills →
          </button>
        </div>
      </aside>

      <div className="backdrop no-print" onClick={() => setMenuOpen(false)} />

      <div className="main">
        <header className="page-header no-print">
          <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            ☰
          </button>
          <div>
            <h1>
              {page.icon} {bill ? "Customer bill" : page.label}
            </h1>
            <p className="muted small">{bill ? "Bill, payments and balance" : page.subtitle}</p>
          </div>
        </header>

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
    </div>
  );
}

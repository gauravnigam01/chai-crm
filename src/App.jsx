import { useState } from "react";
import Entry from "./pages/Entry.jsx";
import DailyReport from "./pages/DailyReport.jsx";
import Bills from "./pages/Bills.jsx";
import People from "./pages/People.jsx";
import Items from "./pages/Items.jsx";
import Settings from "./pages/Settings.jsx";
import More from "./pages/More.jsx";
import CustomerBill from "./pages/CustomerBill.jsx";
import { accountOf, rupees, useStore } from "./store.jsx";

// `parent: "more"` pages are reached from the More page on phones
const PAGES = [
  { key: "entry", icon: "🏠", label: "Home", subtitle: "Tap a customer to add what they took", Page: Entry },
  { key: "bills", icon: "🧾", label: "Bills", subtitle: "Who owes how much", Page: Bills },
  { key: "daily", icon: "📅", label: "Report", subtitle: "Sale and money for one day", Page: DailyReport },
  { key: "more", icon: "☰", label: "More", subtitle: "Customers, items and backup", Page: More, phoneOnly: true },
  { key: "people", icon: "👥", label: "Customers", subtitle: "Names, mobile numbers and addresses", Page: People, parent: "more" },
  { key: "items", icon: "🍵", label: "Items", subtitle: "What you sell and the price", Page: Items, parent: "more" },
  { key: "settings", icon: "💾", label: "Backup", subtitle: "Save a copy of your data", Page: Settings, parent: "more" },
];

const BOTTOM_NAV = ["entry", "bills", "daily", "more"];

export default function App() {
  const { people, entries, payments } = useStore();
  const [pageKey, setPageKey] = useState("entry");
  // When set, the customer's own bill is shown in place of the page: { personId, range }
  const [bill, setBill] = useState(null);
  const page = PAGES.find((p) => p.key === pageKey);
  const { Page } = page;
  const backTo = bill ? null : page.parent;

  const toCollect = people.reduce((sum, p) => sum + Math.max(0, accountOf(p.id, entries, payments).balance), 0);

  function goTo(key) {
    setBill(null);
    setPageKey(key);
    window.scrollTo(0, 0);
  }

  const activeNav = page.parent || page.key;

  return (
    <div className="layout">
      <aside className="sidebar no-print">
        <div className="brand">
          <span className="brand-icon">☕</span>
          <div>
            <strong>Chai Tracker</strong>
            <span>CRM</span>
          </div>
        </div>

        <nav className="nav">
          {PAGES.filter((p) => !p.phoneOnly).map((p) => (
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

      <div className="main">
        <header className="page-header no-print">
          {(backTo || bill) && (
            <button className="back-btn" aria-label="Back" onClick={() => (bill ? setBill(null) : goTo(backTo))}>
              ←
            </button>
          )}
          <div>
            <h1>
              {page.icon} {bill ? "Customer bill" : page.label}
            </h1>
            <p className="muted small">{bill ? "Bill, payments and balance" : page.subtitle}</p>
          </div>
          {!bill && pageKey === "entry" && (
            <span className="header-collect">
              <span className="muted small">To collect</span>
              <strong>{rupees(toCollect)}</strong>
            </span>
          )}
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

      <nav className="bottom-nav no-print">
        {BOTTOM_NAV.map((key) => {
          const p = PAGES.find((x) => x.key === key);
          return (
            <button key={key} className={activeNav === key ? "bn-item active" : "bn-item"} onClick={() => goTo(key)}>
              <span className="bn-icon">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

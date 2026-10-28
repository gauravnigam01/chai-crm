import { useState } from "react";
import { SHIFTS, accountOf, currentShift, formatDate, itemsText, rupees, summarize, today, useStore } from "../store.jsx";
import CustomerForm from "../components/CustomerForm.jsx";
import CustomerSheet from "../components/CustomerSheet.jsx";
import Balance from "../components/Balance.jsx";

const SHIFT_ICONS = { morning: "🌅", afternoon: "☀️", evening: "🌇" };

// Home: tap a customer card, then tap what they took
export default function Entry({ goTo }) {
  const { people, items, entries, payments, itemLabel } = useStore();
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState(currentShift);
  const [changingTime, setChangingTime] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const shiftLabel = SHIFTS.find((s) => s.key === shift).label;
  const isToday = date === today();

  const shiftEntries = entries.filter((e) => e.date === date && e.shift === shift);
  const daySale = summarize(entries.filter((e) => e.date === date)).amount;
  const dayReceived = payments.filter((p) => p.date === date).reduce((sum, p) => sum + p.amount, 0);

  const term = search.trim().toLowerCase();
  const activePeople = people.filter((p) => p.active);
  const visible = activePeople.filter((p) => p.name.toLowerCase().includes(term));
  const openPerson = people.find((p) => p.id === openId);

  if (!items.some((i) => i.active)) {
    return (
      <div className="card empty big-empty">
        <p>First, add what you sell (tea, coffee, juice).</p>
        <button className="btn primary big" onClick={() => goTo("items")}>
          + Add items
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card when">
        <button className="when-btn" onClick={() => setChangingTime(!changingTime)} aria-expanded={changingTime}>
          <span>
            📅 {isToday ? "Today" : formatDate(date)} · {SHIFT_ICONS[shift]} {shiftLabel}
          </span>
          <span className="small link">{changingTime ? "Close" : "Change"}</span>
        </button>
        {changingTime && (
          <div className="controls">
            <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
            <div className="picker">
              {SHIFTS.map((s) => (
                <button key={s.key} className={s.key === shift ? "pill active" : "pill"} onClick={() => setShift(s.key)}>
                  {SHIFT_ICONS[s.key]} {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="summary-strip">
        <div>
          <span>{isToday ? "Today's sale" : "Sale"}</span>
          <strong>{rupees(daySale)}</strong>
        </div>
        <div>
          <span>Money received</span>
          <strong>{rupees(dayReceived)}</strong>
        </div>
      </div>

      {activePeople.length === 0 ? (
        <div className="card empty big-empty">
          <p>Add your first customer.</p>
          <button className="btn primary big" onClick={() => setShowForm(true)}>
            + Add customer
          </button>
        </div>
      ) : (
        <>
          {activePeople.length > 6 && (
            <input className="search" placeholder="🔍 Search customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          )}
          <p className="muted small hint">👆 Tap a customer to add tea, coffee, juice…</p>
          <div className="customer-grid">
            {visible.map((p) => {
              const s = summarize(shiftEntries.filter((e) => e.personId === p.id));
              return (
                <button key={p.id} className={s.qty ? "customer-tile has" : "customer-tile"} onClick={() => setOpenId(p.id)}>
                  <span className="avatar">{p.name.trim().charAt(0).toUpperCase()}</span>
                  <span className="ct-name">{p.name}</span>
                  <span className="ct-items small">{s.qty ? itemsText(s, itemLabel) : "—"}</span>
                  {s.qty > 0 && <strong className="ct-amount">{rupees(s.amount)}</strong>}
                  <Balance balance={accountOf(p.id, entries, payments).balance} />
                </button>
              );
            })}
            <button className="customer-tile add-tile" onClick={() => setShowForm(true)}>
              <span className="avatar">+</span>
              <span className="ct-name">New customer</span>
            </button>
          </div>
          {visible.length === 0 && <p className="muted center">No customer named “{search}”.</p>}
        </>
      )}

      {openPerson && <CustomerSheet person={openPerson} date={date} shift={shift} onClose={() => setOpenId(null)} />}
      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}
    </>
  );
}

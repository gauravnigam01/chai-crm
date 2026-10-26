import { useState } from "react";
import { SHIFTS, currentShift, itemsText, rupees, summarize, today, useStore } from "../store.jsx";
import CustomerForm from "../components/CustomerForm.jsx";

function Counter({ qty, label, onChange }) {
  return (
    <div className="counter">
      <button aria-label={`One less ${label}`} disabled={!qty} onClick={() => onChange(qty - 1)}>
        −
      </button>
      <span className="count">{qty}</span>
      <button aria-label={`One more ${label}`} onClick={() => onChange(qty + 1)}>
        +
      </button>
    </div>
  );
}

export default function Entry({ goTo }) {
  const { people, items, entries, setQty, itemName } = useStore();
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState(currentShift);
  const [openId, setOpenId] = useState(null); // customer whose items are shown
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const activeItems = items.filter((i) => i.active);

  const shiftEntries = entries.filter((e) => e.date === date && e.shift === shift);
  const shiftSummary = summarize(shiftEntries);
  const daySummary = summarize(entries.filter((e) => e.date === date));

  const qtyFor = (personId, itemId) =>
    shiftEntries.find((e) => e.personId === personId && e.itemId === itemId)?.qty || 0;

  const term = search.trim().toLowerCase();
  const activePeople = people.filter((p) => p.active);
  const visible = activePeople.filter((p) => p.name.toLowerCase().includes(term));

  if (activeItems.length === 0) {
    return (
      <div className="card empty">
        <p>No items yet. Add tea, coffee, juice, snacks etc. first.</p>
        <button className="btn primary" onClick={() => goTo("items")}>
          Add items
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card controls">
        <label>
          Date
          <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <div className="picker">
          {SHIFTS.map((s) => (
            <button key={s.key} className={s.key === shift ? "pill active" : "pill"} onClick={() => setShift(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="summary-strip">
        <div>
          <span>This shift</span>
          <strong>{rupees(shiftSummary.amount)}</strong>
          <span>{shiftSummary.qty} items</span>
        </div>
        <div>
          <span>Whole day</span>
          <strong>{rupees(daySummary.amount)}</strong>
          <span>{daySummary.qty} items</span>
        </div>
      </div>

      {activePeople.length === 0 ? (
        <div className="card empty">
          <p>No customers yet. Add the people you serve.</p>
          <button className="btn primary" onClick={() => setShowForm(true)}>
            + Add customer
          </button>
        </div>
      ) : (
        <>
          <input className="search" placeholder="🔍 Search customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="card list">
            {visible.map((p) => {
              const ps = summarize(shiftEntries.filter((e) => e.personId === p.id));
              const open = openId === p.id;
              return (
                <div key={p.id} className={`customer${ps.qty ? " has" : ""}${open ? " open" : ""}`}>
                  <button className="row customer-toggle" aria-expanded={open} onClick={() => setOpenId(open ? null : p.id)}>
                    <span className="who">
                      <span className="name">{p.name}</span>
                      <span className="muted small">
                        {ps.qty > 0 ? `${itemsText(ps, itemName)} · ${rupees(ps.amount)}` : "Nothing yet"}
                      </span>
                    </span>
                    <span className={ps.qty ? "btn extra-btn filled" : "btn extra-btn"}>
                      {open ? "Done ✓" : ps.qty ? `${ps.qty} · Edit` : "+ Add"}
                    </span>
                  </button>

                  {open && (
                    <div className="extras">
                      {activeItems.map((i) => (
                        <div key={i.id} className={qtyFor(p.id, i.id) ? "extra-row picked" : "extra-row"}>
                          <span>
                            {i.name} <span className="muted small">{rupees(i.price)}</span>
                          </span>
                          <Counter
                            qty={qtyFor(p.id, i.id)}
                            label={`${i.name} for ${p.name}`}
                            onChange={(qty) => setQty(date, shift, p.id, i.id, qty)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {visible.length === 0 && <p className="muted pad">No customer named “{search}”.</p>}
          </div>
          <button className="btn" onClick={() => setShowForm(true)}>
            + Add customer
          </button>
          <p className="muted small center">
            Tap a customer, then tap + on what they took (tea, coffee, juice…). Entries save automatically.
          </p>
        </>
      )}

      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}
    </>
  );
}

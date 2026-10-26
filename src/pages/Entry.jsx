import { useState } from "react";
import { SHIFTS, currentShift, itemsText, rupees, summarize, today, useStore } from "../store.jsx";

export default function Entry({ goTo }) {
  const { people, items, entries, setQty, addPerson, itemName } = useStore();
  const activeItems = items.filter((i) => i.active);
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState(currentShift);
  const [itemId, setItemId] = useState(activeItems[0]?.id);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  // The selected item may have been hidden since; fall back to the first active one
  const item = activeItems.find((i) => i.id === itemId) || activeItems[0];

  const shiftEntries = entries.filter((e) => e.date === date && e.shift === shift);
  const shiftSummary = summarize(shiftEntries);
  const daySummary = summarize(entries.filter((e) => e.date === date));

  const qtyFor = (personId) =>
    shiftEntries.find((e) => e.personId === personId && e.itemId === item?.id)?.qty || 0;
  const personSummary = (personId) => summarize(shiftEntries.filter((e) => e.personId === personId));

  const term = search.trim().toLowerCase();
  const activePeople = people.filter((p) => p.active);
  const visible = activePeople.filter((p) => p.name.toLowerCase().includes(term));

  function quickAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    addPerson(newName);
    setNewName("");
  }

  if (!item) {
    return (
      <div className="card empty">
        <p>No items yet. Add tea, coffee, snacks etc. first.</p>
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
        <div className="picker items">
          {activeItems.map((i) => (
            <button key={i.id} className={i.id === item.id ? "pill item active" : "pill item"} onClick={() => setItemId(i.id)}>
              {i.name} <span className="pill-price">{rupees(i.price)}</span>
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
          <form className="inline-form" onSubmit={quickAdd}>
            <input placeholder="Name (e.g. Sharma ji, Office 2)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn primary">Add</button>
          </form>
        </div>
      ) : (
        <>
          <input className="search" placeholder="🔍 Search customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="card list">
            {visible.map((p) => {
              const qty = qtyFor(p.id);
              const ps = personSummary(p.id);
              return (
                <div key={p.id} className={ps.qty ? "row has" : "row"}>
                  <div className="who">
                    <span className="name">{p.name}</span>
                    {ps.qty > 0 && (
                      <span className="muted small">
                        {itemsText(ps, itemName)} · {rupees(ps.amount)}
                      </span>
                    )}
                  </div>
                  <div className="counter">
                    <button
                      aria-label={`One less ${item.name} for ${p.name}`}
                      disabled={!qty}
                      onClick={() => setQty(date, shift, p.id, item.id, qty - 1)}
                    >
                      −
                    </button>
                    <span className="count">{qty}</span>
                    <button
                      aria-label={`One more ${item.name} for ${p.name}`}
                      onClick={() => setQty(date, shift, p.id, item.id, qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && <p className="muted pad">No customer named “{search}”.</p>}
          </div>
          <form className="inline-form" onSubmit={quickAdd}>
            <input placeholder="Add a new customer…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn">+ Add</button>
          </form>
          <p className="muted small center">
            Entries save automatically. Pick an item above, then tap + for each customer.
          </p>
        </>
      )}
    </>
  );
}

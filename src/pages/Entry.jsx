import { useState } from "react";
import { SHIFTS, currentShift, itemsText, rupees, summarize, today, useStore } from "../store.jsx";

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
  const { people, items, entries, setQty, addPerson, itemName } = useStore();
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState(currentShift);
  const [openId, setOpenId] = useState(null); // customer whose extra items are shown
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  // The first item (Tea by default) gets a counter right on each row; the rest are "extras"
  const activeItems = items.filter((i) => i.active);
  const [mainItem, ...extraItems] = activeItems;

  const shiftEntries = entries.filter((e) => e.date === date && e.shift === shift);
  const shiftSummary = summarize(shiftEntries);
  const daySummary = summarize(entries.filter((e) => e.date === date));

  const qtyFor = (personId, itemId) =>
    shiftEntries.find((e) => e.personId === personId && e.itemId === itemId)?.qty || 0;

  const term = search.trim().toLowerCase();
  const activePeople = people.filter((p) => p.active);
  const visible = activePeople.filter((p) => p.name.toLowerCase().includes(term));

  function quickAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    addPerson(newName);
    setNewName("");
  }

  if (!mainItem) {
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
            <div className="list-columns muted small">
              <span>Customer</span>
              <span>{mainItem.name}</span>
            </div>
            {visible.map((p) => {
              const ps = summarize(shiftEntries.filter((e) => e.personId === p.id));
              const extraCount = extraItems.reduce((sum, i) => sum + qtyFor(p.id, i.id), 0);
              const open = openId === p.id;
              return (
                <div key={p.id} className={`customer${ps.qty ? " has" : ""}${open ? " open" : ""}`}>
                  <div className="row">
                    <div className="who">
                      <span className="name">{p.name}</span>
                      {ps.qty > 0 && (
                        <span className="muted small">
                          {itemsText(ps, itemName)} · {rupees(ps.amount)}
                        </span>
                      )}
                    </div>
                    <div className="row-actions">
                      <button
                        className={extraCount ? "btn extra-btn filled" : "btn extra-btn"}
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? null : p.id)}
                      >
                        {open ? "Done" : extraCount ? `Extra (${extraCount})` : "+ Extra"}
                      </button>
                      <Counter
                        qty={qtyFor(p.id, mainItem.id)}
                        label={`${mainItem.name} for ${p.name}`}
                        onChange={(qty) => setQty(date, shift, p.id, mainItem.id, qty)}
                      />
                    </div>
                  </div>

                  {open && (
                    <div className="extras">
                      {extraItems.map((i) => (
                        <div key={i.id} className="extra-row">
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
                      {extraItems.length === 0 && (
                        <p className="muted small">
                          No extra items yet.{" "}
                          <button className="link" onClick={() => goTo("items")}>
                            Add coffee, biscuit, samosa…
                          </button>
                        </p>
                      )}
                    </div>
                  )}
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
            Tap + for {mainItem.name}. Tap “+ Extra” to add other items for that customer. Entries save automatically.
          </p>
        </>
      )}
    </>
  );
}

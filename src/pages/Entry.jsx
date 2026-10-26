import { useState } from "react";
import { SHIFTS, currentShift, rupees, today, useStore } from "../store.jsx";

export default function Entry({ goTo }) {
  const { people, entries, price, setCups, addPerson } = useStore();
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState(currentShift);
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  const shiftEntries = entries.filter((e) => e.date === date && e.shift === shift);
  const cupsFor = (personId) => shiftEntries.find((e) => e.personId === personId)?.cups || 0;
  const shiftCups = shiftEntries.reduce((sum, e) => sum + e.cups, 0);
  const shiftAmount = shiftEntries.reduce((sum, e) => sum + e.cups * e.price, 0);

  const dayEntries = entries.filter((e) => e.date === date);
  const dayCups = dayEntries.reduce((sum, e) => sum + e.cups, 0);

  const term = search.trim().toLowerCase();
  const visible = people.filter((p) => p.active && p.name.toLowerCase().includes(term));

  function quickAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    addPerson(newName);
    setNewName("");
  }

  return (
    <>
      <div className="card controls">
        <label>
          Tareekh
          <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <div className="shift-picker">
          {SHIFTS.map((s) => (
            <button key={s.key} className={s.key === shift ? "pill active" : "pill"} onClick={() => setShift(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="summary-strip">
        <div>
          <span>Is shift mein</span>
          <strong>{shiftCups} chai</strong>
          <span>{rupees(shiftAmount)}</span>
        </div>
        <div>
          <span>Poore din</span>
          <strong>{dayCups} chai</strong>
          <span>Rate {rupees(price)}/chai</span>
        </div>
      </div>

      {people.filter((p) => p.active).length === 0 ? (
        <div className="card empty">
          <p>Abhi koi naam nahi hai. Pehle naam jodo jinko chai jaati hai.</p>
          <form className="inline-form" onSubmit={quickAdd}>
            <input placeholder="Naam (jaise Sharma ji, Office 2)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn primary">Jodo</button>
          </form>
        </div>
      ) : (
        <>
          <input className="search" placeholder="🔍 Naam dhundho…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="card list">
            {visible.map((p) => {
              const cups = cupsFor(p.id);
              return (
                <div key={p.id} className={cups ? "row has" : "row"}>
                  <span className="name">{p.name}</span>
                  <div className="counter">
                    <button aria-label={`${p.name} ki ek chai kam`} disabled={!cups} onClick={() => setCups(date, shift, p.id, cups - 1)}>
                      −
                    </button>
                    <span className="count">{cups}</span>
                    <button aria-label={`${p.name} ki ek chai aur`} onClick={() => setCups(date, shift, p.id, cups + 1)}>
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && <p className="muted pad">“{search}” naam ka koi nahi mila.</p>}
          </div>
          <form className="inline-form" onSubmit={quickAdd}>
            <input placeholder="Naya naam jodo…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn">+ Jodo</button>
          </form>
          <p className="muted small center">
            Entry apne aap save hoti hai. Hisaab dekhne ke liye{" "}
            <button className="link" onClick={() => goTo("report")}>
              Hisaab
            </button>{" "}
            kholo.
          </p>
        </>
      )}
    </>
  );
}

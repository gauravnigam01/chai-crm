import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "chai_hisaab_v1";

export const SHIFTS = [
  { key: "morning", label: "Subah" },
  { key: "afternoon", label: "Dopahar" },
  { key: "evening", label: "Shaam" },
];

const EMPTY_DATA = {
  price: 10,
  // { id, name, phone, active }
  people: [],
  // { id, date: "YYYY-MM-DD", shift, personId, cups, price }
  // price is stored per entry so changing the chai price never changes old bills
  entries: [],
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...EMPTY_DATA, ...saved } : EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function isValidData(data) {
  return (
    data &&
    typeof data.price === "number" &&
    Array.isArray(data.people) &&
    Array.isArray(data.entries)
  );
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or blocked; data stays in memory for this session
    }
  }, [data]);

  const actions = {
    setPrice(price) {
      setData((d) => ({ ...d, price }));
    },

    addPerson(name, phone = "") {
      const person = { id: newId(), name: name.trim(), phone: phone.trim(), active: true };
      setData((d) => ({ ...d, people: [...d.people, person] }));
      return person;
    },

    updatePerson(id, changes) {
      setData((d) => ({ ...d, people: d.people.map((p) => (p.id === id ? { ...p, ...changes } : p)) }));
    },

    // People with entries are only hidden, so their old bills stay correct
    removePerson(id) {
      setData((d) =>
        d.entries.some((e) => e.personId === id)
          ? { ...d, people: d.people.map((p) => (p.id === id ? { ...p, active: false } : p)) }
          : { ...d, people: d.people.filter((p) => p.id !== id) }
      );
    },

    // One entry per person per shift per day; setting cups to 0 removes it
    setCups(date, shift, personId, cups) {
      setData((d) => {
        const existing = d.entries.find((e) => e.date === date && e.shift === shift && e.personId === personId);
        if (cups <= 0) {
          return existing ? { ...d, entries: d.entries.filter((e) => e !== existing) } : d;
        }
        if (existing) {
          return { ...d, entries: d.entries.map((e) => (e === existing ? { ...e, cups } : e)) };
        }
        return { ...d, entries: [...d.entries, { id: newId(), date, shift, personId, cups, price: d.price }] };
      });
    },

    replaceAll(newData) {
      setData({ ...EMPTY_DATA, ...newData });
    },
  };

  return <StoreContext.Provider value={{ ...data, ...actions }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

// ---------- date helpers (all local time) ----------

export function toDateKey(date) {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export function today() {
  return toDateKey(new Date());
}

export function currentShift() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 16) return "afternoon";
  return "evening";
}

export function formatDate(dateKey) {
  return new Date(dateKey + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function rupees(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

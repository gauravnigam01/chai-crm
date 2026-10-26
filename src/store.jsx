import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "chai_tracker_v2";
const OLD_STORAGE_KEY = "chai_hisaab_v1";

export const SHIFTS = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
];

const DEFAULT_ITEMS = [{ id: "tea", name: "Tea", price: 10, active: true }];

// Small pictures for items; picked in the Items page or guessed from the name
export const ITEM_ICONS = [
  "🍵", "☕", "🧃", "🍋", "🥛", "💧", "🥤", "🍪", "🥟", "🥪", "🍰",
  "🍞", "🍜", "🧆", "🥚", "🍟", "🫓", "🍛", "🍦", "🍌", "🍎", "🍽️",
];

const ICON_GUESSES = [
  [/cof|kof|kaapi/, "☕"],
  [/tea|chai|chay/, "🍵"],
  [/juice|jus/, "🧃"],
  [/lemon|nimbu|shikanji/, "🍋"],
  [/milk|doodh|dudh|lassi|chaas|shake/, "🥛"],
  [/water|pani|bisleri/, "💧"],
  [/cold|coke|pepsi|sprite|soda|drink|thums/, "🥤"],
  [/biscuit|biskit|cookie|rusk|toast/, "🍪"],
  [/samosa|momo|kachori/, "🥟"],
  [/sandwich|burger/, "🥪"],
  [/cake|pastry|muffin/, "🍰"],
  [/bread|bun|pav/, "🍞"],
  [/maggi|noodle/, "🍜"],
  [/pakod|pakor|bhaji|vada|wada/, "🧆"],
  [/egg|anda|omelet/, "🥚"],
  [/chips|fries|namkeen/, "🍟"],
  [/paratha|roti|chapati/, "🫓"],
  [/poha|upma|rice|chawal|thali/, "🍛"],
  [/ice ?cream|kulfi/, "🍦"],
  [/banana|kela/, "🍌"],
  [/apple|fruit/, "🍎"],
];

export function guessIcon(name = "") {
  const n = name.toLowerCase();
  return ICON_GUESSES.find(([re]) => re.test(n))?.[1] || "🍽️";
}

export function iconOf(item) {
  return item.icon || guessIcon(item.name);
}

const EMPTY_DATA = {
  // { id, name, price, icon, active } — icon is optional, see iconOf()
  items: DEFAULT_ITEMS,
  // { id, name, phone, address, active }
  people: [],
  // { id, date: "YYYY-MM-DD", shift, personId, itemId, qty, price }
  // or a one-off typed-in item: { id, date, shift, personId, itemId: null, name, qty, amount }
  // price is stored per entry so changing an item's price never changes old bills
  entries: [],
  // money received from customers: { id, personId, date, amount, mode: "Cash" | "UPI" }
  payments: [],
};

// v1 had a single chai price and entries with `cups`; turn that into a "Tea" item
export function migrate(raw) {
  if (!raw || !Array.isArray(raw.people) || !Array.isArray(raw.entries)) return null;
  if (Array.isArray(raw.items)) return { ...EMPTY_DATA, ...raw };

  const tea = { ...DEFAULT_ITEMS[0], price: typeof raw.price === "number" ? raw.price : 10 };
  return {
    ...EMPTY_DATA,
    items: [tea],
    people: raw.people,
    entries: raw.entries.map(({ cups, ...e }) => ({ ...e, itemId: tea.id, qty: cups })),
  };
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY));
    return migrate(saved) || EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
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

  // Hidden (not deleted) when they have entries, so old bills stay correct
  function removeOrHide(listKey, refKey, id) {
    setData((d) => ({
      ...d,
      [listKey]: d.entries.some((e) => e[refKey] === id)
        ? d[listKey].map((x) => (x.id === id ? { ...x, active: false } : x))
        : d[listKey].filter((x) => x.id !== id),
    }));
  }

  function update(listKey, id, changes) {
    setData((d) => ({ ...d, [listKey]: d[listKey].map((x) => (x.id === id ? { ...x, ...changes } : x)) }));
  }

  const actions = {
    // details: { name, phone, address }
    addPerson(details) {
      setData((d) => ({ ...d, people: [...d.people, { id: newId(), phone: "", address: "", ...details, active: true }] }));
    },
    updatePerson: (id, changes) => update("people", id, changes),
    removePerson: (id) => removeOrHide("people", "personId", id),

    addItem(name, price, icon) {
      setData((d) => ({ ...d, items: [...d.items, { id: newId(), name: name.trim(), price, icon, active: true }] }));
    },
    updateItem: (id, changes) => update("items", id, changes),
    removeItem: (id) => removeOrHide("items", "itemId", id),

    // One entry per person, item, shift and day; qty 0 removes it
    setQty(date, shift, personId, itemId, qty) {
      setData((d) => {
        const match = (e) => e.date === date && e.shift === shift && e.personId === personId && e.itemId === itemId;
        const existing = d.entries.find(match);
        if (qty <= 0) return existing ? { ...d, entries: d.entries.filter((e) => e !== existing) } : d;
        if (existing) return { ...d, entries: d.entries.map((e) => (e === existing ? { ...e, qty } : e)) };
        const price = d.items.find((i) => i.id === itemId)?.price || 0;
        return { ...d, entries: [...d.entries, { id: newId(), date, shift, personId, itemId, qty, price }] };
      });
    },

    // A one-off item typed in on the spot (not in the Items list), with its total amount
    addCustom(date, shift, personId, name, qty, amount) {
      setData((d) => ({
        ...d,
        entries: [...d.entries, { id: newId(), date, shift, personId, itemId: null, name: name.trim(), qty, amount }],
      }));
    },

    removeEntry(id) {
      setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) }));
    },

    addPayment(personId, amount, date, mode) {
      setData((d) => ({ ...d, payments: [...d.payments, { id: newId(), personId, date, amount, mode }] }));
    },

    removePayment(id) {
      setData((d) => ({ ...d, payments: d.payments.filter((p) => p.id !== id) }));
    },

    replaceAll(newData) {
      setData({ ...EMPTY_DATA, ...newData });
    },
  };

  const value = {
    ...data,
    ...actions,
    itemName,
    itemIcon,
    // "🍵 Tea"
    itemLabel: (key) => `${itemIcon(key)} ${itemName(key)}`,
  };

  function itemName(key) {
    return isCustomKey(key) ? key.slice(CUSTOM_PREFIX.length) : data.items.find((i) => i.id === key)?.name || "Item";
  }

  function itemIcon(key) {
    const item = isCustomKey(key) ? null : data.items.find((i) => i.id === key);
    return item ? iconOf(item) : guessIcon(itemName(key));
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

// ---------- totals ----------

function emptyTotals() {
  return { qty: 0, amount: 0, morning: 0, afternoon: 0, evening: 0 };
}

// Custom (typed-in) entries are grouped by name under this key prefix
const CUSTOM_PREFIX = "custom:";

export function isCustomKey(key) {
  return typeof key === "string" && key.startsWith(CUSTOM_PREFIX);
}

function itemKey(e) {
  return e.itemId || CUSTOM_PREFIX + e.name;
}

export function entryAmount(e) {
  return e.amount ?? e.qty * e.price;
}

function add(totals, e) {
  const amount = entryAmount(e);
  totals.qty += e.qty;
  totals.amount += amount;
  totals[e.shift] += amount;
}

// Totals overall, per item and per shift for a list of entries
export function summarize(entries) {
  const total = emptyTotals();
  const byItem = new Map();
  for (const e of entries) {
    add(total, e);
    const key = itemKey(e);
    if (!byItem.has(key)) byItem.set(key, { ...emptyTotals(), qtyByShift: { morning: 0, afternoon: 0, evening: 0 } });
    const item = byItem.get(key);
    add(item, e);
    item.qtyByShift[e.shift] += e.qty;
  }
  return { ...total, byItem };
}

// All-time account of one customer. balance > 0: they owe us; balance < 0: they paid in advance.
export function accountOf(personId, entries, payments) {
  const billed = entries.filter((e) => e.personId === personId).reduce((sum, e) => sum + entryAmount(e), 0);
  const received = payments.filter((p) => p.personId === personId).reduce((sum, p) => sum + p.amount, 0);
  return { billed, received, balance: billed - received };
}

export function groupBy(entries, key) {
  const map = new Map();
  for (const e of entries) {
    if (!map.has(e[key])) map.set(e[key], []);
    map.get(e[key]).push(e);
  }
  return map;
}

// "Tea × 2, Biscuit × 1"
export function itemsText(summary, itemName) {
  return [...summary.byItem.entries()].map(([id, t]) => `${itemName(id)} × ${t.qty}`).join(", ");
}

// ---------- date helpers (all local time) ----------

export function toDateKey(date) {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

export function today() {
  return toDateKey(new Date());
}

export function shiftDate(dateKey, days) {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function currentShift() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 16) return "afternoon";
  return "evening";
}

export function formatDate(dateKey, withWeekday = false) {
  return new Date(dateKey + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: withWeekday ? "short" : undefined,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function rupees(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

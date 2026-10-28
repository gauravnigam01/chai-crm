const LINKS = [
  { key: "people", icon: "👥", label: "Customers", text: "Add or edit names, mobile, address" },
  { key: "items", icon: "🍵", label: "Items & prices", text: "Tea, coffee, juice and their rates" },
  { key: "settings", icon: "💾", label: "Backup", text: "Save a copy of all your data" },
];

export default function More({ goTo }) {
  return (
    <div className="more-list">
      {LINKS.map((l) => (
        <button key={l.key} className="card more-link" onClick={() => goTo(l.key)}>
          <span className="more-icon">{l.icon}</span>
          <span className="who">
            <strong>{l.label}</strong>
            <span className="muted small">{l.text}</span>
          </span>
          <span className="muted">›</span>
        </button>
      ))}
    </div>
  );
}

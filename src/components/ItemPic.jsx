import { ITEM_ICONS } from "../store.jsx";

// Small round picture for an item
export default function ItemPic({ icon, size = "md" }) {
  return (
    <span className={`item-pic ${size}`} aria-hidden="true">
      {icon}
    </span>
  );
}

// Choose a picture; tapping the chosen one again clears it (picture is then guessed from the name)
export function IconPicker({ value, onChange }) {
  return (
    <div className="icon-picker" role="radiogroup" aria-label="Item picture">
      {ITEM_ICONS.map(({ icon, label }) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === icon}
          key={icon}
          className={value === icon ? "icon-choice active" : "icon-choice"}
          onClick={() => onChange(value === icon ? null : icon)}
        >
          <span className="icon-emoji">{icon}</span>
          <span className="icon-label">{label}</span>
        </button>
      ))}
    </div>
  );
}

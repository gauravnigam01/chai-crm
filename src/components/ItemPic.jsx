import { ITEM_ICONS, guessIcon } from "../store.jsx";

// Small round picture for an item
export default function ItemPic({ icon, size = "md" }) {
  return (
    <span className={`item-pic ${size}`} aria-hidden="true">
      {icon}
    </span>
  );
}

// Choose a picture; null means "auto" (guessed from the item name)
export function IconPicker({ value, name, onChange }) {
  return (
    <div className="icon-picker" role="radiogroup" aria-label="Item picture">
      <button
        type="button"
        role="radio"
        aria-checked={!value}
        className={!value ? "icon-choice auto active" : "icon-choice auto"}
        onClick={() => onChange(null)}
        title="Pick automatically from the name"
      >
        {guessIcon(name)}
        <span>Auto</span>
      </button>
      {ITEM_ICONS.map((icon) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === icon}
          key={icon}
          className={value === icon ? "icon-choice active" : "icon-choice"}
          onClick={() => onChange(icon)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

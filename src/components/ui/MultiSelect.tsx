import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  values,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };
  const display = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label)
    .join(", ");

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".multiselect-dropdown")) setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        className={`flex min-h-[38px] w-full items-center justify-between rounded border px-3 py-2 text-sm bg-background ${
          disabled ? "opacity-60 pointer-events-none" : "cursor-pointer"
        }`}
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        tabIndex={0}
      >
        <span className={display ? "" : "text-muted-foreground"}>
          {display || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded border bg-popover shadow-md multiselect-dropdown max-h-48 overflow-auto">
          {options.length === 0 && (
            <div className="px-3 py-2 text-muted-foreground text-xs">
              Nenhuma opção
            </div>
          )}
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`flex items-center w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                values.includes(option.value) ? "bg-muted/50 font-semibold" : ""
              }`}
              onClick={() => toggleValue(option.value)}
            >
              <span className="flex-1">{option.label}</span>
              {values.includes(option.value) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

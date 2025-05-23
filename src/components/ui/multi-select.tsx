import * as React from "react";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MultiSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function MultiSelect({
  value,
  onValueChange,
  placeholder = "Select options",
  disabled = false,
  children,
  className,
  ...props
}: MultiSelectProps) {
  const values = value ? value.split(",") : [];
  
  const handleSelect = (itemValue: string) => {
    // If value is already selected, remove it
    if (values.includes(itemValue)) {
      const newValues = values.filter((v) => v !== itemValue);
      onValueChange(newValues.join(","));
    } else {
      // Otherwise add it
      onValueChange([...values, itemValue].join(","));
    }
  };
  
  return (
    <div className={cn("relative", className)} {...props}>
      <SelectTrigger 
        disabled={disabled}
        className="w-full"
        aria-label={placeholder}
      >
        <SelectValue placeholder={placeholder}>
          {values.length > 0 
            ? `${values.length} selecionado${values.length !== 1 ? 's' : ''}` 
            : placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          const childValue = (child.props as any).value;
          
          return React.cloneElement(child as React.ReactElement<any>, {
            key: childValue,
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              handleSelect(childValue);
            },
            "aria-selected": values.includes(childValue)
          });
        })}
      </SelectContent>
    </div>
  );
}

export { SelectItem };

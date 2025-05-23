
import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MultiSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const MultiSelect = ({ value, onValueChange, children }: MultiSelectProps) => {
  // The component passes through to the underlying Select
  // but adds special handling for comma-separated values
  return (
    <Select value={value} onValueChange={onValueChange}>
      {children}
    </Select>
  );
};

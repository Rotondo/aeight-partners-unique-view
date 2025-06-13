import * as React from "react";
import { logControlledField } from "@/lib/logControlledField";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input base reutilizável.
 * Protege globalmente para NUNCA passar undefined/null como value controlado.
 * Filtra `children` para evitar erro de void element.
 * Log detalhado em dev sobre value inválido.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // Remove children para garantir que <input /> nunca os receba (void element)
  ({ value, children, ...props }, ref) => {
    // Garante valor seguro para inputs controlados
    const safeValue =
      props.type === "number"
        ? value === undefined || value === null || value === "" ? "" : value
        : value === undefined || value === null ? "" : value;

    logControlledField("Input", value, props);

    // Nunca passe children para <input />
    return (
      <input
        ref={ref}
        value={safeValue}
        {...props}
        className={props.className}
      />
    );
  }
);

Input.displayName = "Input";

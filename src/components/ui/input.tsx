
import * as React from "react";
import { logControlledField } from "@/lib/logControlledField";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input base reutilizável.
 * Protege globalmente para NUNCA passar undefined/null como value controlado.
 * Para inputs de arquivo (type="file"), usa modo não-controlado.
 * Filtra `children` para evitar erro de void element.
 * Log detalhado em dev sobre value inválido.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // Remove children para garantir que <input /> nunca os receba (void element)
  ({ className, type, value, children, ...props }, ref) => {
    // Para inputs de arquivo, não usar value (devem ser não-controlados)
    if (type === "file") {
      return (
        <input
          ref={ref}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      );
    }

    // Garante valor seguro para inputs controlados (não-arquivo)
    const safeValue = React.useMemo(() => {
      // Se não há value definido, deixar como undefined para componente não controlado
      if (value === undefined) {
        return undefined;
      }
      // Se value é null ou outro valor, converter para string
      if (value === null) {
        return "";
      }
      return String(value);
    }, [value]);

    logControlledField("Input", value, props);

    // Nunca passe children para <input />
    return (
      <input
        ref={ref}
        type={type}
        value={safeValue}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

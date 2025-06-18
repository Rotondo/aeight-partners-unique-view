
import * as React from "react";
import { cn } from "@/lib/utils";
import { logControlledField } from "@/lib/logControlledField";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea base reutilizável com proteção aprimorada contra valores undefined.
 * Compatível com react-hook-form e outras bibliotecas de formulário.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, name, value, defaultValue, onChange, ...props }, ref) => {
    // Em desenvolvimento, avisa se não há id nem name
    if (process.env.NODE_ENV !== "production" && !id && !name) {
      console.warn(
        "[Textarea] Recomenda-se fornecer pelo menos um 'id' ou 'name' para campos de formulário."
      );
    }

    // Proteção robusta para value controlado - NUNCA permitir undefined/null
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

    // Log otimizado apenas em dev
    logControlledField("Textarea", value, { ...props, id, name });

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        id={id}
        name={name}
        value={safeValue}
        defaultValue={defaultValue}
        onChange={onChange}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

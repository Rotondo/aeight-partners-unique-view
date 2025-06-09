import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea base reutilizável.
 * Exige que o dev forneça pelo menos `id` ou `name` para acessibilidade/autofill.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, id, name, ...props }, ref) => {
    // Em desenvolvimento, avisa se não há id nem name
    if (process.env.NODE_ENV !== "production" && !id && !name) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Textarea] Recomenda-se fornecer pelo menos um 'id' ou 'name' para campos de formulário para garantir acessibilidade e autofill."
      );
    }
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        id={id}
        name={name}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

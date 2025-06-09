import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input base reutilizável.
 * Exige que o dev forneça pelo menos `id` ou `name` para acessibilidade/autofill.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, id, name, ...props }, ref) => {
    // Em desenvolvimento, avisa se não há id nem name
    if (process.env.NODE_ENV !== "production" && !id && !name) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Input] Recomenda-se fornecer pelo menos um 'id' ou 'name' para campos de formulário para garantir acessibilidade e autofill."
      );
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
Input.displayName = "Input";

export { Input };

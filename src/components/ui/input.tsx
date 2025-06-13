import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, ...props }, ref) => {
    // Protege o input para nunca receber undefined/null como value controlado
    const safeValue =
      props.type === "number"
        ? value === undefined || value === null || value === "" ? "" : value
        : value === undefined || value === null ? "" : value;

    // Loga em dev se algum valor perigoso chegar (para debugging global)
    if (
      process.env.NODE_ENV === "development" &&
      props.hasOwnProperty("value") &&
      (value === undefined || value === null)
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        "[Input] value recebido como",
        value,
        "em",
        props.name || props.id || "<sem nome>"
      );
    }

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

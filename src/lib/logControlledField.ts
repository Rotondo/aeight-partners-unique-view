
/**
 * Helper para logar problemas de campos controlados (undefined/null) em dev.
 * Versão otimizada com menos logs excessivos.
 */
export function logControlledField(
  kind: string,
  value: any,
  props: Record<string, any>
) {
  if (
    process.env.NODE_ENV === "development" &&
    (value === undefined || value === null)
  ) {
    // Log apenas uma vez por componente para evitar spam
    const componentKey = `${kind}-${props.name || props.id || "unnamed"}`;
    if (!window.__loggedControlledFields) {
      window.__loggedControlledFields = new Set();
    }
    
    if (!window.__loggedControlledFields.has(componentKey)) {
      window.__loggedControlledFields.add(componentKey);
      // eslint-disable-next-line no-console
      console.warn(
        `[${kind}] value é ${value} em ${props.name || props.id || "<sem nome>"}`
      );
    }
  }
}

// Extend window type for TypeScript
declare global {
  interface Window {
    __loggedControlledFields?: Set<string>;
  }
}

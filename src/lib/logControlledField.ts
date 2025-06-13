/**
 * Helper para logar problemas de campos controlados (undefined/null) em dev.
 * Exibe nome, id, props e stack trace para facilitar a localização do erro.
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
    // eslint-disable-next-line no-console
    console.error(
      `[${kind}] value é ${value} em ${props.name || props.id || "<sem nome>"} props:`,
      props
    );
    // stack trace para saber o ponto de origem
    // eslint-disable-next-line no-console
    console.trace();
  }
}

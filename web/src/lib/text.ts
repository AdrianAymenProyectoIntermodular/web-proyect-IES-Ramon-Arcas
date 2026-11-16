/** Iniciales para avatares sin foto: "Lucía Montoya Ferrer" -> "LM". */
export function initials(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase('es'))
    .join('');
}

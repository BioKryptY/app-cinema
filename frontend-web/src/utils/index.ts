// Compara identificadores vindos da API sem depender do tipo.
// O json-server devolve ids como string ("3", "277f"), mas um db.json escrito
// a mao pode ter numero. Comparar como texto cobre os dois casos.
export function mesmoId(a: string | number | undefined, b: string | number | undefined): boolean {
  if (a === undefined || b === undefined) return false;
  return String(a) === String(b);
}

// Formata um valor em reais
export function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2)}`;
}

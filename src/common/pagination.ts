export interface Page<T> {
  data: T[]; // Los elementos de esta página
  page: number; // Pagina actual, empezando en 1
  limit: number; // Elementos por pagina
  total: number; // Total de elementos en toda la lista (sin paginar)
  totalPages: number; // Total de paginas, segun total y limit
}

// Cuantos elementos salta typeor para llegar a page
export function pageSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function toPage<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): Page<T> {
  return {
    data: items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

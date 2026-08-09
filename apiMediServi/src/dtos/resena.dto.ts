export interface CreateResenaDTO {
  citaId: number;
  clienteId: number;
  puntuacion: number;
  comentario?: string;
}

export interface GetResenasFilters {
  perfilProfesionalId?: number;
  clienteId?: number;
  puntuacion?: number;
}
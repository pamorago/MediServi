export interface CreateServicioDTO {
  perfilProfesionalId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado?: 'ACTIVO' | 'INACTIVO';
  especialidadIds?: number[];
}

export interface UpdateServicioDTO {
  perfilProfesionalId?: number;
  categoriaId?: number;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracionMinutos?: number;
  modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado?: 'ACTIVO' | 'INACTIVO';
  especialidadIds?: number[];
}

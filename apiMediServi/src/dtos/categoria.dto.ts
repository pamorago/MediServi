export interface CreateCategoriaDTO {
  nombre: string;
  descripcion?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

export interface UpdateCategoriaDTO {
  nombre?: string;
  descripcion?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

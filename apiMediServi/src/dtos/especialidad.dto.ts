export interface CreateEspecialidadDTO {
  nombre: string;
  descripcion?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

export interface UpdateEspecialidadDTO {
  nombre?: string;
  descripcion?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

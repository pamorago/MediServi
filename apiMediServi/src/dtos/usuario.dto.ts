export interface CreateUsuarioDTO {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";
  estado?: "ACTIVO" | "INACTIVO";
}

export interface UpdateUsuarioDTO {
  nombre?: string;
  apellidos?: string;
  email?: string;
  password?: string;
  telefono?: string;
  rol?: "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";
  estado?: "ACTIVO" | "INACTIVO";
}

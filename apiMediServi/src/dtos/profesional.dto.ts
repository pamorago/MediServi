export interface CreateProfesionalDTO {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia: string;
  canton: string;
  distrito: string;
  tarifaBase: number;
  disponible?: boolean;
  imagenPerfil?: string;
  especialidadIds?: number[];
}

export interface UpdateProfesionalDTO {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  tituloProfesional?: string;
  descripcion?: string;
  aniosExperiencia?: number;
  modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia?: string;
  canton?: string;
  distrito?: string;
  tarifaBase?: number;
  disponible?: boolean;
  imagenPerfil?: string;
  especialidadIds?: number[];
}

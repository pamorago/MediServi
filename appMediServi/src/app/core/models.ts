export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  rol: 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  updatedAt: string;
}

export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  updatedAt: string;
}

export interface Cita {
  id: number;
  clienteId: number;
  servicioId: number;
  perfilProfesionalId: number;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';
  montoEstimado: string;
  comentarioCliente?: string | null;
  comentarioProfesional?: string | null;
  cliente?: Usuario;
  servicio?: Servicio;
  profesional?: Profesional;
  resena?: Resena;
}

export interface Resena {
  id: number;
  citaId: number;
  perfilProfesionalId: number;
  puntuacion: number;
  comentario: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profesional {
  id: number;
  usuarioId: number;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia: string;
  canton: string;
  distrito: string;
  tarifaBase: string;
  disponible: boolean;
  imagenPerfil: string;
  usuario: Usuario;
}

export interface Servicio {
  id: number;
  perfilProfesionalId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: string;
  duracionMinutos: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado: 'ACTIVO' | 'INACTIVO';
  categoria?: Categoria;
  perfil?: Profesional;
  promedioEvaluacion?: number | null;
  totalEvaluaciones?: number;
  especialidades?: Array<{
    especialidadId: number;
    especialidad: Especialidad;
  }>;
  citas?: Cita[];
}

export interface ProfesionalPayload {
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  telefono?: string;
  tituloProfesional: string;
  descripcion: string;
  aniosExperiencia: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  provincia: string;
  canton: string;
  distrito: string;
  tarifaBase: number;
  disponible: boolean;
  imagenPerfil?: string;
  especialidadIds?: number[];
}

export interface ServicioPayload {
  perfilProfesionalId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado: 'ACTIVO' | 'INACTIVO';
  especialidadIds?: number[];
}

export interface CitaPayload {
  clienteId: number;
  servicioId: number;
  perfilProfesionalId: number;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  montoEstimado: number;
  comentarioCliente: string;
}

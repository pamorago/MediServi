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
  imagenPerfil?: string | null;
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
  historial?: HistorialCita[];
}

export interface HistorialCita {
  id: number;
  citaId: number;
  estadoAnterior: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA' | null;
  estadoNuevo: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';
  motivo?: string | null;
  cambiadoPorId: number;
  cambiadoPor?: {
    id: number;
    nombre: string;
    apellidos: string;
    rol: 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';
  };
  createdAt: string;
  updatedAt: string;
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
  especialidades?: Array<{
    especialidadId: number;
    especialidad: Especialidad;
  }>;
  servicios?: Servicio[];
  promedioCalificacion?: number | null;
  cantidadResenas?: number;
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
  modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  comentarioCliente: string;
}

export interface CambiarEstadoCitaPayload {
  nuevoEstado: 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';
  actorId: number;
  actorRol: 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';
  motivo?: string;
  comentarioProfesional?: string;
}

export interface ResenaPayload {
  citaId: number;
  clienteId: number;
  puntuacion: number;
  comentario?: string;
}

// =================== AUTENTICACIÓN ===================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: TokenData;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: CurrentUser;
}

export interface CurrentUser {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';
  estado: 'ACTIVO' | 'INACTIVO';
  telefono?: string;
  imagenPerfil?: string | null;
}

export interface AuthSession {
  token: string;
  user: CurrentUser;
  expiresAt: number;
}

export interface CreateCitaDTO {
  clienteId: number;
  servicioId: number;
  perfilProfesionalId: number;
  fechaCita: string;
  horaInicio: string;
  modalidad: "VIRTUAL" | "PRESENCIAL" | "MIXTA";
  comentarioCliente?: string;
}

export interface UpdateCitaDTO {
  fechaCita?: string;
  horaInicio?: string;
  horaFin?: string;
  modalidad?: "VIRTUAL" | "PRESENCIAL" | "MIXTA";
  comentarioCliente?: string;
  comentarioProfesional?: string;
  montoEstimado?: number;
}

export interface CambiarEstadoCitaDTO {
  nuevoEstado: "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA";
  actorId: number;
  actorRol: "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";
  motivo?: string;
  comentarioProfesional?: string;
}

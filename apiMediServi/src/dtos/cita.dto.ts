export interface CreateCitaDTO {
  clienteId: number;
  servicioId: number;
  perfilProfesionalId: number;
  fechaCita: string;
  horaInicio: string;
  horaFin: string;
  modalidad: "VIRTUAL" | "PRESENCIAL" | "MIXTA";
  montoEstimado: number;
  comentarioCliente?: string;
}

export interface UpdateCitaDTO {
  fechaCita?: string;
  horaInicio?: string;
  horaFin?: string;
  modalidad?: "VIRTUAL" | "PRESENCIAL" | "MIXTA";
  estado?: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA";
  comentarioCliente?: string;
  comentarioProfesional?: string;
  montoEstimado?: number;
}

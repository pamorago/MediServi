import { prisma } from "../config/prisma";
import type { CreateCitaDTO, UpdateCitaDTO } from "../dtos/cita.dto";

interface GetCitasFilters {
  estado?: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA";
  perfilProfesionalId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
}

const getAllCitas = async (filters: GetCitasFilters = {}) => {
  return prisma.cita.findMany({
    where: {
      estado: filters.estado,
      perfilProfesionalId: filters.perfilProfesionalId,
      fechaCita:
        filters.fechaInicio || filters.fechaFin
          ? {
              gte: filters.fechaInicio,
              lte: filters.fechaFin,
            }
          : undefined,
    },
    include: {
      cliente: true,
      servicio: {
        include: {
          categoria: true,
        },
      },
      profesional: { include: { usuario: true } },
    },
    orderBy: { fechaCita: "desc" },
  });
};

const getCitaById = async (id: number) => {
  return prisma.cita.findUnique({
    where: { id },
    include: {
      cliente: true,
      servicio: true,
      profesional: { include: { usuario: true } },
      historial: true,
    },
  });
};

const createCita = async (data: CreateCitaDTO) => {
  return prisma.cita.create({
    data: {
      clienteId: data.clienteId,
      servicioId: data.servicioId,
      perfilProfesionalId: data.perfilProfesionalId,
      fechaCita: new Date(data.fechaCita),
      horaInicio: new Date(`1970-01-01T${data.horaInicio}`),
      horaFin: new Date(`1970-01-01T${data.horaFin}`),
      modalidad: data.modalidad,
      estado: "PENDIENTE",
      montoEstimado: data.montoEstimado,
      comentarioCliente: data.comentarioCliente,
    },
  });
};

const updateCita = async (id: number, data: UpdateCitaDTO) => {
  return prisma.cita.update({
    where: { id },
    data: {
      fechaCita: data.fechaCita ? new Date(data.fechaCita) : undefined,
      horaInicio: data.horaInicio ? new Date(`1970-01-01T${data.horaInicio}`) : undefined,
      horaFin: data.horaFin ? new Date(`1970-01-01T${data.horaFin}`) : undefined,
      modalidad: data.modalidad,
      estado: data.estado,
      comentarioCliente: data.comentarioCliente,
      comentarioProfesional: data.comentarioProfesional,
      montoEstimado: data.montoEstimado,
    },
  });
};

const cancelCita = async (id: number) => {
  return prisma.cita.update({
    where: { id },
    data: { estado: "CANCELADA" },
  });
};

export default {
  getAllCitas,
  getCitaById,
  createCita,
  updateCita,
  cancelCita,
};

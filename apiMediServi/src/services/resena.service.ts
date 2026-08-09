import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";
import type { CreateResenaDTO, GetResenasFilters } from "../dtos/resena.dto";

const crearError = (message: string, status: number) => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

const getResenas = async (filters: GetResenasFilters = {}) => {
  return prisma.resena.findMany({
    where: {
      perfilProfesionalId: filters.perfilProfesionalId,
      puntuacion: filters.puntuacion,
      cita: filters.clienteId
        ? {
            clienteId: filters.clienteId,
          }
        : undefined,
    },
    include: {
      cita: {
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          servicio: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
      profesional: {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const createResena = async (data: CreateResenaDTO) => {
  if (!Number.isInteger(data.puntuacion) || data.puntuacion < 1 || data.puntuacion > 5) {
    throw crearError("La puntuacion debe ser un entero entre 1 y 5", StatusCodes.BAD_REQUEST);
  }

  const comentarioNormalizado = data.comentario?.trim() ?? "";
  if (comentarioNormalizado.length > 500) {
    throw crearError("El comentario no puede superar los 500 caracteres", StatusCodes.BAD_REQUEST);
  }

  const cita = await prisma.cita.findUnique({
    where: { id: data.citaId },
    include: {
      resena: true,
    },
  });

  if (!cita) {
    throw crearError("Cita no encontrada", StatusCodes.NOT_FOUND);
  }

  if (cita.estado !== "COMPLETADA") {
    throw crearError("Solo se puede calificar una cita completada", StatusCodes.BAD_REQUEST);
  }

  if (cita.clienteId !== data.clienteId) {
    throw crearError("El cliente que califica debe corresponder a la cita", StatusCodes.FORBIDDEN);
  }

  if (cita.resena) {
    throw crearError("La cita ya tiene una reseña registrada", StatusCodes.CONFLICT);
  }

  return prisma.resena.create({
    data: {
      citaId: data.citaId,
      perfilProfesionalId: cita.perfilProfesionalId,
      puntuacion: data.puntuacion,
      comentario: comentarioNormalizado,
    },
    include: {
      cita: true,
      profesional: {
        include: {
          usuario: true,
        },
      },
    },
  });
};

export default {
  getResenas,
  createResena,
};

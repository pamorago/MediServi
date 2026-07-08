import { prisma } from '../config/prisma';
import type { CreateServicioDTO, UpdateServicioDTO } from '../dtos/servicio.dto';

interface GetServiciosFilters {
  search?: string;
  categoriaId?: number;
  modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  estado?: 'ACTIVO' | 'INACTIVO';
  precioMin?: number;
  precioMax?: number;
}

const getAllServicios = async (filters: GetServiciosFilters = {}) => {
  const servicios = await prisma.servicio.findMany({
    where: {
      nombre: filters.search ? { contains: filters.search } : undefined,
      categoriaId: filters.categoriaId,
      modalidad: filters.modalidad,
      estado: filters.estado,
      precio:
        filters.precioMin !== undefined || filters.precioMax !== undefined
          ? {
              gte: filters.precioMin,
              lte: filters.precioMax,
            }
          : undefined,
    },
    include: {
      categoria: true,
      perfil: {
        include: {
          usuario: true,
        },
      },
      citas: {
        where: {
          resena: {
            isNot: null,
          },
        },
        select: {
          resena: {
            select: {
              puntuacion: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return servicios.map((servicio) => {
    const puntuaciones = servicio.citas
      .map((cita) => cita.resena?.puntuacion)
      .filter((valor): valor is number => typeof valor === 'number');

    const totalEvaluaciones = puntuaciones.length;
    const promedioEvaluacion = totalEvaluaciones
      ? puntuaciones.reduce((acc, item) => acc + item, 0) / totalEvaluaciones
      : null;

    return {
      ...servicio,
      promedioEvaluacion,
      totalEvaluaciones,
    };
  });
};

const getServicioById = async (id: number) => {
  return prisma.servicio.findUnique({
    where: { id },
    include: {
      categoria: true,
      perfil: {
        include: {
          usuario: true,
        },
      },
      especialidades: {
        include: {
          especialidad: true,
        },
      },
      citas: {
        where: {
          resena: {
            isNot: null,
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          resena: true,
        },
        orderBy: { fechaCita: 'desc' },
      },
    },
  });
};

const createServicio = async (data: CreateServicioDTO) => {
  return prisma.$transaction(async (tx) => {
    const servicio = await tx.servicio.create({
      data: {
        perfilProfesionalId: data.perfilProfesionalId,
        categoriaId: data.categoriaId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        duracionMinutos: data.duracionMinutos,
        modalidad: data.modalidad,
        estado: data.estado ?? 'ACTIVO',
      },
    });

    if (data.especialidadIds?.length) {
      await tx.especialidadServicio.createMany({
        data: data.especialidadIds.map((especialidadId) => ({
          servicioId: servicio.id,
          especialidadId,
        })),
      });
    }

    return servicio;
  });
};

const updateServicio = async (id: number, data: UpdateServicioDTO) => {
  return prisma.$transaction(async (tx) => {
    const servicio = await tx.servicio.update({
      where: { id },
      data: {
        perfilProfesionalId: data.perfilProfesionalId,
        categoriaId: data.categoriaId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        duracionMinutos: data.duracionMinutos,
        modalidad: data.modalidad,
        estado: data.estado,
      },
    });

    if (data.especialidadIds) {
      await tx.especialidadServicio.deleteMany({
        where: { servicioId: id },
      });

      if (data.especialidadIds.length) {
        await tx.especialidadServicio.createMany({
          data: data.especialidadIds.map((especialidadId) => ({
            servicioId: id,
            especialidadId,
          })),
        });
      }
    }

    return servicio;
  });
};

const setEstadoServicio = async (id: number, estado: 'ACTIVO' | 'INACTIVO') => {
  return prisma.servicio.update({
    where: { id },
    data: { estado },
  });
};

export default {
  getAllServicios,
  getServicioById,
  createServicio,
  updateServicio,
  setEstadoServicio,
};

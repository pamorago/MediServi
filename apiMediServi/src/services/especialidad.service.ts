import { prisma } from "../config/prisma";
import type { CreateEspecialidadDTO, UpdateEspecialidadDTO } from "../dtos/especialidad.dto";

interface GetEspecialidadesFilters {
  search?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

const getAllEspecialidades = async (filters: GetEspecialidadesFilters = {}) => {
  return prisma.especialidad.findMany({
    where: {
      nombre: filters.search ? { contains: filters.search } : undefined,
      estado: filters.estado,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getEspecialidadById = async (id: number) => {
  return prisma.especialidad.findUnique({
    where: { id },
  });
};

const createEspecialidad = async (data: CreateEspecialidadDTO) => {
  return prisma.especialidad.create({
    data,
  });
};

const updateEspecialidad = async (id: number, data: UpdateEspecialidadDTO) => {
  return prisma.especialidad.update({
    where: { id },
    data,
  });
};

const deactivateEspecialidad = async (id: number) => {
  return prisma.especialidad.update({
    where: { id },
    data: { estado: "INACTIVO" },
  });
};

const setEstadoEspecialidad = async (id: number, estado: "ACTIVO" | "INACTIVO") => {
  return prisma.especialidad.update({
    where: { id },
    data: { estado },
  });
};

export default {
  getAllEspecialidades,
  getEspecialidadById,
  createEspecialidad,
  updateEspecialidad,
  deactivateEspecialidad,
  setEstadoEspecialidad,
};

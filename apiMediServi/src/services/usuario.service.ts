import { prisma } from "../config/prisma";
import type { CreateUsuarioDTO, UpdateUsuarioDTO } from "../dtos/usuario.dto";

interface GetUsuariosFilters {
  search?: string;
  rol?: "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";
  estado?: "ACTIVO" | "INACTIVO";
}

const getAllUsuarios = async (filters: GetUsuariosFilters = {}) => {
  const where = {
    rol: filters.rol,
    estado: filters.estado,
    OR: filters.search
      ? [
          { nombre: { contains: filters.search } },
          { apellidos: { contains: filters.search } },
          { email: { contains: filters.search } },
        ]
      : undefined,
  };

  return prisma.usuario.findMany({
    where,
    include: { perfil: true },
    orderBy: [{ estado: "asc" }, { createdAt: "desc" }],
  });
};

const getUsuarioById = async (id: number) => {
  return prisma.usuario.findUnique({
    where: { id },
    include: { perfil: true, citas: true, historial: true },
  });
};

const createUsuario = async (data: CreateUsuarioDTO) => {
  return prisma.usuario.create({
    data,
  });
};

const updateUsuario = async (id: number, data: UpdateUsuarioDTO) => {
  return prisma.usuario.update({
    where: { id },
    data,
  });
};

const deactivateUsuario = async (id: number) => {
  return prisma.usuario.update({
    where: { id },
    data: { estado: "INACTIVO" },
  });
};

const setEstadoUsuario = async (id: number, estado: "ACTIVO" | "INACTIVO") => {
  return prisma.usuario.update({
    where: { id },
    data: { estado },
  });
};

export default {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deactivateUsuario,
  setEstadoUsuario,
};

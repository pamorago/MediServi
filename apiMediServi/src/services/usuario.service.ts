import { prisma } from "../config/prisma";
import { StatusCodes } from "http-status-codes";
import type { CreateUsuarioDTO, UpdateUsuarioDTO } from "../dtos/usuario.dto";

const crearError = (message: string, status: number) => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

/**
 * Evita dejar el sistema sin ningun ADMINISTRADOR activo: se usa antes de
 * cambiarle el rol o desactivar a un usuario que hoy es administrador.
 */
const asegurarQuedaOtroAdminActivo = async (usuarioId: number) => {
  const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
  if (!usuario || usuario.rol !== "ADMINISTRADOR" || usuario.estado !== "ACTIVO") {
    return;
  }

  const otrosAdminsActivos = await prisma.usuario.count({
    where: {
      rol: "ADMINISTRADOR",
      estado: "ACTIVO",
      id: { not: usuarioId },
    },
  });

  if (otrosAdminsActivos === 0) {
    throw crearError(
      "No se puede completar la operacion: el sistema quedaria sin ningun administrador activo.",
      StatusCodes.BAD_REQUEST,
    );
  }
};

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
    data: {
      nombre: data.nombre,
      apellidos: data.apellidos,
      email: data.email,
      password: data.password,
      telefono: data.telefono,
      rol: data.rol ?? "CLIENTE",
      estado: data.estado ?? "ACTIVO",
    },
  });
};

const updateUsuario = async (id: number, data: UpdateUsuarioDTO) => {
  // Si se esta cambiando el rol (dejando de ser ADMINISTRADOR) o
  // desactivando a un admin, primero confirmamos que quede otro activo.
  if (data.rol !== undefined || data.estado === "INACTIVO") {
    await asegurarQuedaOtroAdminActivo(id);
  }

  return prisma.usuario.update({
    where: { id },
    data,
  });
};

const deactivateUsuario = async (id: number) => {
  await asegurarQuedaOtroAdminActivo(id);
  return prisma.usuario.update({
    where: { id },
    data: { estado: "INACTIVO" },
  });
};

const setEstadoUsuario = async (id: number, estado: "ACTIVO" | "INACTIVO") => {
  if (estado === "INACTIVO") {
    await asegurarQuedaOtroAdminActivo(id);
  }

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

import { prisma } from "../config/prisma";
import type { CreateCategoriaDTO, UpdateCategoriaDTO } from "../dtos/categoria.dto";

interface GetCategoriasFilters {
  search?: string;
  estado?: "ACTIVO" | "INACTIVO";
}

const getAllCategorias = async (filters: GetCategoriasFilters = {}) => {
  const normalizedSearch = filters.search?.trim();

  return prisma.categoriaServicio.findMany({
    where: {
      nombre: normalizedSearch
        ? {
            contains: normalizedSearch,
            mode: "insensitive",
          }
        : undefined,
      estado: filters.estado,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getCategoriaById = async (id: number) => {
  return prisma.categoriaServicio.findUnique({
    where: { id },
  });
};

const createCategoria = async (data: CreateCategoriaDTO) => {
  return prisma.categoriaServicio.create({
    data,
  });
};

const updateCategoria = async (id: number, data: UpdateCategoriaDTO) => {
  return prisma.categoriaServicio.update({
    where: { id },
    data,
  });
};

const deactivateCategoria = async (id: number) => {
  return prisma.categoriaServicio.update({
    where: { id },
    data: { estado: "INACTIVO" },
  });
};

const setEstadoCategoria = async (id: number, estado: "ACTIVO" | "INACTIVO") => {
  return prisma.categoriaServicio.update({
    where: { id },
    data: { estado },
  });
};

export default {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deactivateCategoria,
  setEstadoCategoria,
};

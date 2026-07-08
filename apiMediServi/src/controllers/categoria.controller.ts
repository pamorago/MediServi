import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import categoriaService from "../services/categoria.service";
import type { CreateCategoriaDTO, UpdateCategoriaDTO } from "../dtos/categoria.dto";

const getCategorias = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      search?: string;
      estado?: "ACTIVO" | "INACTIVO";
    };

    const categorias = await categoriaService.getAllCategorias({
      search: query.search,
      estado: query.estado,
    });
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

const getCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const categoria = await categoriaService.getCategoriaById(id);

    if (!categoria) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Categoría no encontrada" });
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

const createCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateCategoriaDTO;

    if (!data.nombre) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "El nombre de la categoría es obligatorio" });
    }

    const categoria = await categoriaService.createCategoria(data);
    res.status(StatusCodes.CREATED).json(categoria);
  } catch (error) {
    next(error);
  }
};

const updateCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body as UpdateCategoriaDTO;

    const categoria = await categoriaService.updateCategoria(id, data);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

const deleteCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const categoria = await categoriaService.deactivateCategoria(id);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

const setEstadoCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body as { estado: "ACTIVO" | "INACTIVO" };

    if (!estado || (estado !== "ACTIVO" && estado !== "INACTIVO")) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "El estado debe ser ACTIVO o INACTIVO" });
    }

    const categoria = await categoriaService.setEstadoCategoria(id, estado);
    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

export default {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  setEstadoCategoria,
};

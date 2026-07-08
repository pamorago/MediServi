import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import especialidadService from "../services/especialidad.service";
import type { CreateEspecialidadDTO, UpdateEspecialidadDTO } from "../dtos/especialidad.dto";

const getEspecialidades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      search?: string;
      estado?: "ACTIVO" | "INACTIVO";
    };

    const especialidades = await especialidadService.getAllEspecialidades({
      search: query.search,
      estado: query.estado,
    });
    res.json(especialidades);
  } catch (error) {
    next(error);
  }
};

const getEspecialidad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const especialidad = await especialidadService.getEspecialidadById(id);

    if (!especialidad) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Especialidad no encontrada" });
    }

    res.json(especialidad);
  } catch (error) {
    next(error);
  }
};

const createEspecialidad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateEspecialidadDTO;

    if (!data.nombre) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "El nombre de la especialidad es obligatorio" });
    }

    const especialidad = await especialidadService.createEspecialidad(data);
    res.status(StatusCodes.CREATED).json(especialidad);
  } catch (error) {
    next(error);
  }
};

const updateEspecialidad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body as UpdateEspecialidadDTO;

    const especialidad = await especialidadService.updateEspecialidad(id, data);
    res.json(especialidad);
  } catch (error) {
    next(error);
  }
};

const deleteEspecialidad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const especialidad = await especialidadService.deactivateEspecialidad(id);
    res.json(especialidad);
  } catch (error) {
    next(error);
  }
};

const setEstadoEspecialidad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body as { estado: "ACTIVO" | "INACTIVO" };

    if (!estado || (estado !== "ACTIVO" && estado !== "INACTIVO")) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "El estado debe ser ACTIVO o INACTIVO" });
    }

    const especialidad = await especialidadService.setEstadoEspecialidad(id, estado);
    res.json(especialidad);
  } catch (error) {
    next(error);
  }
};

export default {
  getEspecialidades,
  getEspecialidad,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad,
  setEstadoEspecialidad,
};

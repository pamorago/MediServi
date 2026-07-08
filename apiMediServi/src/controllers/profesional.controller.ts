import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import profesionalService from '../services/profesional.service';
import type { CreateProfesionalDTO, UpdateProfesionalDTO } from '../dtos/profesional.dto';

const getProfesionales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      search?: string;
      modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
      disponible?: string;
    };

    const profesionales = await profesionalService.getAllProfesionales({
      search: query.search,
      modalidad: query.modalidad,
      disponible: query.disponible !== undefined ? query.disponible === 'true' : undefined,
    });

    res.json(profesionales);
  } catch (error) {
    next(error);
  }
};

const getProfesional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const profesional = await profesionalService.getProfesionalById(id);

    if (!profesional) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Profesional no encontrado' });
    }

    res.json(profesional);
  } catch (error) {
    next(error);
  }
};

const createProfesional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateProfesionalDTO;

    if (!data.nombre || !data.apellidos || !data.email || !data.password || !data.tituloProfesional || !data.descripcion) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Nombre, apellidos, email, password, titulo y descripcion son obligatorios' });
    }

    if (data.aniosExperiencia < 0 || data.tarifaBase <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Experiencia valida y tarifa mayor a cero son obligatorias' });
    }

    const payload: CreateProfesionalDTO = {
      ...data,
      password: await bcrypt.hash(data.password, 10),
    };

    const profesional = await profesionalService.createProfesional(payload);
    res.status(StatusCodes.CREATED).json(profesional);
  } catch (error) {
    next(error);
  }
};

const updateProfesional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body as UpdateProfesionalDTO;

    if (data.aniosExperiencia !== undefined && data.aniosExperiencia < 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'La experiencia debe ser valida' });
    }

    if (data.tarifaBase !== undefined && data.tarifaBase <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'La tarifa debe ser mayor a cero' });
    }

    const profesional = await profesionalService.updateProfesional(id, data);

    if (!profesional) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Profesional no encontrado' });
    }

    res.json(profesional);
  } catch (error) {
    next(error);
  }
};

const setDisponibilidad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { disponible } = req.body as { disponible: boolean };

    if (typeof disponible !== 'boolean') {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Debe indicar disponible como true o false' });
    }

    const profesional = await profesionalService.setDisponibilidad(id, disponible);
    res.json(profesional);
  } catch (error) {
    next(error);
  }
};

export default {
  getProfesionales,
  getProfesional,
  createProfesional,
  updateProfesional,
  setDisponibilidad,
};

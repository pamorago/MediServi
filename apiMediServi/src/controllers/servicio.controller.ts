import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import servicioService from '../services/servicio.service';
import type { CreateServicioDTO, UpdateServicioDTO } from '../dtos/servicio.dto';

const getServicios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      search?: string;
      categoriaId?: string;
      modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
      estado?: 'ACTIVO' | 'INACTIVO';
      precioMin?: string;
      precioMax?: string;
    };

    const servicios = await servicioService.getAllServicios({
      search: query.search,
      categoriaId: query.categoriaId ? Number(query.categoriaId) : undefined,
      modalidad: query.modalidad,
      estado: query.estado,
      precioMin: query.precioMin ? Number(query.precioMin) : undefined,
      precioMax: query.precioMax ? Number(query.precioMax) : undefined,
    });

    res.json(servicios);
  } catch (error) {
    next(error);
  }
};

const getServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const servicio = await servicioService.getServicioById(id);

    if (!servicio) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    next(error);
  }
};

const createServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateServicioDTO;

    if (!data.nombre || !data.perfilProfesionalId || !data.categoriaId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Nombre, profesional y categoria son obligatorios' });
    }

    if (data.precio <= 0 || data.duracionMinutos <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Precio y duracion deben ser mayores a cero' });
    }

    const servicio = await servicioService.createServicio(data);
    res.status(StatusCodes.CREATED).json(servicio);
  } catch (error) {
    next(error);
  }
};

const updateServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body as UpdateServicioDTO;

    if (data.precio !== undefined && data.precio <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El precio debe ser mayor a cero' });
    }

    if (data.duracionMinutos !== undefined && data.duracionMinutos <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'La duracion debe ser mayor a cero' });
    }

    const servicio = await servicioService.updateServicio(id, data);
    res.json(servicio);
  } catch (error) {
    next(error);
  }
};

const setEstadoServicio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body as { estado: 'ACTIVO' | 'INACTIVO' };

    if (!estado || (estado !== 'ACTIVO' && estado !== 'INACTIVO')) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'El estado debe ser ACTIVO o INACTIVO' });
    }

    const servicio = await servicioService.setEstadoServicio(id, estado);
    res.json(servicio);
  } catch (error) {
    next(error);
  }
};

export default {
  getServicios,
  getServicio,
  createServicio,
  updateServicio,
  setEstadoServicio,
};

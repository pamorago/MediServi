import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import citaService from "../services/cita.service";
import type { CreateCitaDTO, UpdateCitaDTO } from "../dtos/cita.dto";

const getCitas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      estado?: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA";
      perfilProfesionalId?: string;
      fechaInicio?: string;
      fechaFin?: string;
    };

    const citas = await citaService.getAllCitas({
      estado: query.estado,
      perfilProfesionalId: query.perfilProfesionalId ? Number(query.perfilProfesionalId) : undefined,
      fechaInicio: query.fechaInicio ? new Date(query.fechaInicio) : undefined,
      fechaFin: query.fechaFin ? new Date(query.fechaFin) : undefined,
    });
    res.json(citas);
  } catch (error) {
    next(error);
  }
};

const getCita = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const cita = await citaService.getCitaById(id);

    if (!cita) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Cita no encontrada" });
    }

    res.json(cita);
  } catch (error) {
    next(error);
  }
};

const createCita = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateCitaDTO;

    if (!data.clienteId || !data.servicioId || !data.perfilProfesionalId || !data.fechaCita || !data.horaInicio || !data.horaFin || !data.modalidad || data.montoEstimado === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Todos los campos obligatorios deben ser enviados" });
    }

    const cita = await citaService.createCita(data);
    res.status(StatusCodes.CREATED).json(cita);
  } catch (error) {
    next(error);
  }
};

const updateCita = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body as UpdateCitaDTO;

    const cita = await citaService.updateCita(id, data);
    res.json(cita);
  } catch (error) {
    next(error);
  }
};

const deleteCita = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const cita = await citaService.cancelCita(id);
    res.json(cita);
  } catch (error) {
    next(error);
  }
};

export default {
  getCitas,
  getCita,
  createCita,
  updateCita,
  deleteCita,
};

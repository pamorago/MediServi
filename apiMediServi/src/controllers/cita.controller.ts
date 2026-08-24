import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import citaService, { parsearFechaLocal } from "../services/cita.service";
import type { CambiarEstadoCitaDTO, CreateCitaDTO, UpdateCitaDTO } from "../dtos/cita.dto";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";

const getCitas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      estado?: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA";
      perfilProfesionalId?: string;
      fechaInicio?: string;
      fechaFin?: string;
    };

    // Se usa parsearFechaLocal (en vez de `new Date(string)`) para evitar
    // que el filtro de fecha quede un dia corrido por la diferencia entre
    // interpretar el string como UTC vs. como hora local del servidor.
    const fechaFinFiltro = query.fechaFin ? parsearFechaLocal(query.fechaFin) : undefined;
    if (fechaFinFiltro) {
      // "Hasta" debe incluir todo ese dia, no solo su medianoche.
      fechaFinFiltro.setHours(23, 59, 59, 999);
    }

    const citas = await citaService.getAllCitas({
      estado: query.estado,
      perfilProfesionalId: query.perfilProfesionalId ? Number(query.perfilProfesionalId) : undefined,
      fechaInicio: query.fechaInicio ? parsearFechaLocal(query.fechaInicio) : undefined,
      fechaFin: fechaFinFiltro,
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

const createCita = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Solo un CLIENTE puede solicitar una cita, y siempre a su propio nombre.
    // No se confia en clienteId enviado por el body: se usa el id verificado
    // del token (req.userId) para evitar que alguien solicite citas a nombre
    // de otro usuario.
    if (req.userRole !== "CLIENTE") {
      return res.status(StatusCodes.FORBIDDEN).json({ error: "Solo un cliente puede solicitar una cita" });
    }

    const data = { ...(req.body as CreateCitaDTO), clienteId: req.userId };

    if (!data.clienteId || !data.servicioId || !data.perfilProfesionalId || !data.fechaCita || !data.horaInicio || !data.modalidad) {
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

    if ((req.body as { estado?: string }).estado) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "El estado de la cita debe cambiarse mediante el endpoint de transiciones" });
    }

    const cita = await citaService.updateCita(id, data);
    res.json(cita);
  } catch (error) {
    next(error);
  }
};

const cambiarEstadoCita = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const data = req.body as CambiarEstadoCitaDTO;

    if (!data.nuevoEstado || !data.actorId || !data.actorRol) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Debe indicar nuevoEstado, actorId y actorRol para realizar la transicion",
      });
    }

    const cita = await citaService.cambiarEstadoCita(id, data);
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
  cambiarEstadoCita,
  deleteCita,
};

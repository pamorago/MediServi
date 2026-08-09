import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import resenaService from "../services/resena.service";
import type { CreateResenaDTO } from "../dtos/resena.dto";

const getResenas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      perfilProfesionalId?: string;
      clienteId?: string;
      puntuacion?: string;
    };

    const resenas = await resenaService.getResenas({
      perfilProfesionalId: query.perfilProfesionalId ? Number(query.perfilProfesionalId) : undefined,
      clienteId: query.clienteId ? Number(query.clienteId) : undefined,
      puntuacion: query.puntuacion ? Number(query.puntuacion) : undefined,
    });

    res.json(resenas);
  } catch (error) {
    next(error);
  }
};

const createResena = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateResenaDTO;

    if (!data.citaId || !data.clienteId || !data.puntuacion) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Debe indicar citaId, clienteId y puntuacion",
      });
    }

    const resena = await resenaService.createResena(data);
    res.status(StatusCodes.CREATED).json(resena);
  } catch (error) {
    next(error);
  }
};

export default {
  getResenas,
  createResena,
};

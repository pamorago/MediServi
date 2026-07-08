import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import usuarioService from "../services/usuario.service";
import type { CreateUsuarioDTO, UpdateUsuarioDTO } from "../dtos/usuario.dto";

const getUsuarios = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as {
      search?: string;
      rol?: "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";
      estado?: "ACTIVO" | "INACTIVO";
    };

    const usuarios = await usuarioService.getAllUsuarios({
      search: query.search,
      rol: query.rol,
      estado: query.estado,
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const getUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const usuario = await usuarioService.getUsuarioById(id);

    if (!usuario) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const createUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body as CreateUsuarioDTO;

    if (!data.nombre || !data.apellidos || !data.email || !data.password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Nombre, apellidos, email y password son obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const usuario = await usuarioService.createUsuario({ ...data, password: hashedPassword });

    res.status(StatusCodes.CREATED).json(usuario);
  } catch (error) {
    next(error);
  }
};

const updateUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const payload = req.body as UpdateUsuarioDTO;
    const data: UpdateUsuarioDTO = { ...payload };

    if (payload.password) {
      data.password = await bcrypt.hash(payload.password, 10);
    }

    const usuario = await usuarioService.updateUsuario(id, data);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const deleteUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const usuario = await usuarioService.deactivateUsuario(id);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

const setEstadoUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body as { estado: "ACTIVO" | "INACTIVO" };

    if (!estado || (estado !== "ACTIVO" && estado !== "INACTIVO")) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "El estado debe ser ACTIVO o INACTIVO" });
    }

    const usuario = await usuarioService.setEstadoUsuario(id, estado);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

export default {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  setEstadoUsuario,
};

import { Router } from "express";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { perfil: true },
    });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: { perfil: true, citas: true, historial: true },
    });

    if (!usuario) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Usuario no encontrado",
      });
    }

    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { nombre, apellidos, email, password, telefono, rol, estado } = req.body;

    if (!nombre || !apellidos || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Nombre, apellidos, email y password son obligatorios",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellidos,
        email,
        password: hashedPassword,
        telefono,
        rol,
        estado,
      },
    });

    res.status(StatusCodes.CREATED).json(usuario);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { password, ...rest } = req.body;
    const data: any = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
    });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { estado: "INACTIVO" },
    });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

export default router;

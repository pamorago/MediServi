import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const especialidades = await prisma.especialidad.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(especialidades);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const especialidad = await prisma.especialidad.findUnique({
      where: { id },
    });

    if (!especialidad) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Especialidad no encontrada",
      });
    }

    res.json(especialidad);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "El nombre de la especialidad es obligatorio",
      });
    }

    const especialidad = await prisma.especialidad.create({
      data: {
        nombre,
        descripcion,
        estado,
      },
    });

    res.status(StatusCodes.CREATED).json(especialidad);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion, estado } = req.body;

    const especialidad = await prisma.especialidad.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        estado,
      },
    });

    res.json(especialidad);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const especialidad = await prisma.especialidad.update({
      where: { id },
      data: { estado: "INACTIVO" },
    });

    res.json(especialidad);
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const categorias = await prisma.categoriaServicio.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(categorias);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const categoria = await prisma.categoriaServicio.findUnique({
      where: { id },
    });

    if (!categoria) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Categoría no encontrada",
      });
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "El nombre de la categoría es obligatorio",
      });
    }

    const categoria = await prisma.categoriaServicio.create({
      data: {
        nombre,
        descripcion,
        estado,
      },
    });

    res.status(StatusCodes.CREATED).json(categoria);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nombre, descripcion, estado } = req.body;

    const categoria = await prisma.categoriaServicio.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        estado,
      },
    });

    res.json(categoria);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const categoria = await prisma.categoriaServicio.update({
      where: { id },
      data: { estado: "INACTIVO" },
    });

    res.json(categoria);
  } catch (error) {
    next(error);
  }
});

export default router;

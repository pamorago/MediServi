import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const citas = await prisma.cita.findMany({
      include: {
        cliente: true,
        servicio: true,
        profesional: { include: { usuario: true } },
      },
      orderBy: { fechaCita: "desc" },
    });
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cita = await prisma.cita.findUnique({
      where: { id },
      include: {
        cliente: true,
        servicio: true,
        profesional: { include: { usuario: true } },
        historial: true,
      },
    });

    if (!cita) {
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Cita no encontrada",
      });
    }

    res.json(cita);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      clienteId,
      servicioId,
      perfilProfesionalId,
      fechaCita,
      horaInicio,
      horaFin,
      modalidad,
      montoEstimado,
      comentarioCliente,
    } = req.body;

    if (!clienteId || !servicioId || !perfilProfesionalId || !fechaCita || !horaInicio || !horaFin || !modalidad || !montoEstimado) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: "Todos los campos obligatorios deben ser enviados",
      });
    }

    const cita = await prisma.cita.create({
      data: {
        clienteId,
        servicioId,
        perfilProfesionalId,
        fechaCita: new Date(fechaCita),
        horaInicio: new Date(`1970-01-01T${horaInicio}`),
        horaFin: new Date(`1970-01-01T${horaFin}`),
        modalidad,
        montoEstimado,
        comentarioCliente,
      },
    });

    res.status(StatusCodes.CREATED).json(cita);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const {
      fechaCita,
      horaInicio,
      horaFin,
      modalidad,
      estado,
      comentarioCliente,
      comentarioProfesional,
      montoEstimado,
    } = req.body;

    const cita = await prisma.cita.update({
      where: { id },
      data: {
        fechaCita: fechaCita ? new Date(fechaCita) : undefined,
        horaInicio: horaInicio ? new Date(`1970-01-01T${horaInicio}`) : undefined,
        horaFin: horaFin ? new Date(`1970-01-01T${horaFin}`) : undefined,
        modalidad,
        estado,
        comentarioCliente,
        comentarioProfesional,
        montoEstimado,
      },
    });

    res.json(cita);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cita = await prisma.cita.update({
      where: { id },
      data: { estado: "CANCELADA" },
    });

    res.json(cita);
  } catch (error) {
    next(error);
  }
});

export default router;

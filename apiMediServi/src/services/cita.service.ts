import { prisma } from "../config/prisma";
import { StatusCodes } from "http-status-codes";
import type { CambiarEstadoCitaDTO, CreateCitaDTO, UpdateCitaDTO } from "../dtos/cita.dto";

interface GetCitasFilters {
  estado?: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA" | "COMPLETADA";
  perfilProfesionalId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
}

const crearError = (message: string, status: number) => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

const parseTime = (time: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    throw crearError("El formato de hora debe ser HH:mm", StatusCodes.BAD_REQUEST);
  }

  const horas = Number(match[1]);
  const minutos = Number(match[2]);

  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    throw crearError("La hora indicada no es valida", StatusCodes.BAD_REQUEST);
  }

  return { horas, minutos };
};

const toTimeDate = (horas: number, minutos: number) => {
  return new Date(`1970-01-01T${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:00`);
};

const calcularHoraFin = (horaInicio: string, duracionMinutos: number) => {
  const { horas, minutos } = parseTime(horaInicio);
  const totalMinutos = horas * 60 + minutos + duracionMinutos;

  if (totalMinutos >= 24 * 60) {
    throw crearError("La hora final excede el limite diario permitido", StatusCodes.BAD_REQUEST);
  }

  return {
    horaInicioDate: toTimeDate(horas, minutos),
    horaFinDate: toTimeDate(Math.floor(totalMinutos / 60), totalMinutos % 60),
  };
};

const construirFechaHora = (fecha: Date, hora: Date) => {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    hora.getHours(),
    hora.getMinutes(),
    0,
    0,
  );
};

const validarFechaFutura = (fechaCita: Date, horaInicio: Date) => {
  const fechaHoraCita = construirFechaHora(fechaCita, horaInicio);
  if (Number.isNaN(fechaHoraCita.getTime())) {
    throw crearError("La fecha u hora de la cita no es valida", StatusCodes.BAD_REQUEST);
  }

  if (fechaHoraCita <= new Date()) {
    throw crearError("No se permiten citas en fecha u hora pasada", StatusCodes.BAD_REQUEST);
  }
};

const validarTraslape = async (
  perfilProfesionalId: number,
  fechaCita: Date,
  horaInicio: Date,
  horaFin: Date,
  citaIdExcluir?: number,
) => {
  const citasDelProfesional = await prisma.cita.findMany({
    where: {
      perfilProfesionalId,
      fechaCita,
      estado: {
        in: ["PENDIENTE", "ACEPTADA"],
      },
      id: citaIdExcluir ? { not: citaIdExcluir } : undefined,
    },
    select: {
      id: true,
      horaInicio: true,
      horaFin: true,
    },
  });

  const inicioNuevo = horaInicio.getHours() * 60 + horaInicio.getMinutes();
  const finNuevo = horaFin.getHours() * 60 + horaFin.getMinutes();

  const hayTraslape = citasDelProfesional.some((cita) => {
    const inicioActual = cita.horaInicio.getHours() * 60 + cita.horaInicio.getMinutes();
    const finActual = cita.horaFin.getHours() * 60 + cita.horaFin.getMinutes();
    return inicioNuevo < finActual && finNuevo > inicioActual;
  });

  if (hayTraslape) {
    throw crearError("Existe un conflicto de horario para este profesional", StatusCodes.CONFLICT);
  }
};

const getAllCitas = async (filters: GetCitasFilters = {}) => {
  return prisma.cita.findMany({
    where: {
      estado: filters.estado,
      perfilProfesionalId: filters.perfilProfesionalId,
      fechaCita:
        filters.fechaInicio || filters.fechaFin
          ? {
              gte: filters.fechaInicio,
              lte: filters.fechaFin,
            }
          : undefined,
    },
    include: {
      cliente: true,
      servicio: {
        include: {
          categoria: true,
        },
      },
      profesional: { include: { usuario: true } },
      resena: true,
    },
    orderBy: { fechaCita: "desc" },
  });
};

const getCitaById = async (id: number) => {
  return prisma.cita.findUnique({
    where: { id },
    include: {
      cliente: true,
      servicio: true,
      profesional: { include: { usuario: true } },
      historial: {
        include: {
          cambiadoPor: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              rol: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      resena: true,
    },
  });
};

const createCita = async (data: CreateCitaDTO) => {
  const fechaCita = new Date(data.fechaCita);
  fechaCita.setHours(0, 0, 0, 0);
  if (Number.isNaN(fechaCita.getTime())) {
    throw crearError("La fecha de la cita no es valida", StatusCodes.BAD_REQUEST);
  }

  const [cliente, profesional, servicio] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: data.clienteId } }),
    prisma.perfilProfesional.findUnique({ where: { id: data.perfilProfesionalId } }),
    prisma.servicio.findUnique({ where: { id: data.servicioId } }),
  ]);

  if (!cliente || cliente.rol !== "CLIENTE" || cliente.estado !== "ACTIVO") {
    throw crearError("El cliente seleccionado no es valido o esta inactivo", StatusCodes.BAD_REQUEST);
  }

  if (!profesional || !profesional.disponible) {
    throw crearError("El profesional seleccionado no esta disponible", StatusCodes.BAD_REQUEST);
  }

  if (!servicio || servicio.estado !== "ACTIVO") {
    throw crearError("El servicio seleccionado no esta activo", StatusCodes.BAD_REQUEST);
  }

  if (servicio.perfilProfesionalId !== data.perfilProfesionalId) {
    throw crearError("El servicio no pertenece al profesional seleccionado", StatusCodes.BAD_REQUEST);
  }

  const { horaInicioDate, horaFinDate } = calcularHoraFin(data.horaInicio, servicio.duracionMinutos);

  validarFechaFutura(fechaCita, horaInicioDate);
  await validarTraslape(data.perfilProfesionalId, fechaCita, horaInicioDate, horaFinDate);

  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.create({
      data: {
        clienteId: data.clienteId,
        servicioId: data.servicioId,
        perfilProfesionalId: data.perfilProfesionalId,
        fechaCita,
        horaInicio: horaInicioDate,
        horaFin: horaFinDate,
        modalidad: data.modalidad,
        estado: "PENDIENTE",
        montoEstimado: servicio.precio,
        comentarioCliente: data.comentarioCliente,
      },
    });

    await tx.historialCita.create({
      data: {
        citaId: cita.id,
        estadoAnterior: null,
        estadoNuevo: "PENDIENTE",
        motivo: "Solicitud de cita creada por cliente",
        cambiadoPorId: data.clienteId,
      },
    });

    return cita;
  });
};

const updateCita = async (id: number, data: UpdateCitaDTO) => {
  const citaActual = await prisma.cita.findUnique({
    where: { id },
    include: {
      servicio: true,
    },
  });

  if (!citaActual) {
    throw crearError("Cita no encontrada", StatusCodes.NOT_FOUND);
  }

  if (["RECHAZADA", "CANCELADA", "COMPLETADA"].includes(citaActual.estado)) {
    throw crearError("No se puede editar una cita en estado final", StatusCodes.BAD_REQUEST);
  }

  const fechaCita = data.fechaCita ? new Date(data.fechaCita) : citaActual.fechaCita;
  fechaCita.setHours(0, 0, 0, 0);

  const horaInicioString = data.horaInicio
    ? data.horaInicio
    : `${String(citaActual.horaInicio.getHours()).padStart(2, "0")}:${String(citaActual.horaInicio.getMinutes()).padStart(2, "0")}`;
  const { horaInicioDate, horaFinDate } = calcularHoraFin(horaInicioString, citaActual.servicio.duracionMinutos);

  validarFechaFutura(fechaCita, horaInicioDate);
  await validarTraslape(citaActual.perfilProfesionalId, fechaCita, horaInicioDate, horaFinDate, id);

  return prisma.cita.update({
    where: { id },
    data: {
      fechaCita,
      horaInicio: horaInicioDate,
      horaFin: horaFinDate,
      modalidad: data.modalidad,
      comentarioCliente: data.comentarioCliente,
      comentarioProfesional: data.comentarioProfesional,
    },
  });
};

const cambiarEstadoCita = async (id: number, data: CambiarEstadoCitaDTO) => {
  const cita = await prisma.cita.findUnique({
    where: { id },
    include: {
      profesional: true,
    },
  });

  if (!cita) {
    throw crearError("Cita no encontrada", StatusCodes.NOT_FOUND);
  }

  const actor = await prisma.usuario.findUnique({ where: { id: data.actorId } });
  if (!actor || actor.estado !== "ACTIVO") {
    throw crearError("El actor de la operacion no es valido", StatusCodes.BAD_REQUEST);
  }

  if (actor.rol !== data.actorRol) {
    throw crearError("El rol del actor no coincide con su usuario", StatusCodes.BAD_REQUEST);
  }

  const estadoActual = cita.estado;
  const estadoNuevo = data.nuevoEstado;

  if (["RECHAZADA", "CANCELADA", "COMPLETADA"].includes(estadoActual)) {
    throw crearError("No se permiten cambios desde estados finales", StatusCodes.BAD_REQUEST);
  }

  if (estadoActual === "PENDIENTE" && estadoNuevo === "ACEPTADA") {
    if (data.actorRol !== "PROFESIONAL" || actor.id !== cita.profesional.usuarioId) {
      throw crearError("Solo el profesional asignado puede aceptar la cita", StatusCodes.FORBIDDEN);
    }
  } else if (estadoActual === "PENDIENTE" && estadoNuevo === "RECHAZADA") {
    if (data.actorRol !== "PROFESIONAL" || actor.id !== cita.profesional.usuarioId) {
      throw crearError("Solo el profesional asignado puede rechazar la cita", StatusCodes.FORBIDDEN);
    }
    if (!data.motivo?.trim()) {
      throw crearError("Debe indicar un motivo al rechazar la cita", StatusCodes.BAD_REQUEST);
    }
  } else if (estadoActual === "PENDIENTE" && estadoNuevo === "CANCELADA") {
    if (data.actorRol !== "CLIENTE" || actor.id !== cita.clienteId) {
      throw crearError("Solo el cliente propietario puede cancelar una cita pendiente", StatusCodes.FORBIDDEN);
    }
  } else if (estadoActual === "ACEPTADA" && estadoNuevo === "CANCELADA") {
    const esClientePropietario = data.actorRol === "CLIENTE" && actor.id === cita.clienteId;
    const esProfesionalAsignado = data.actorRol === "PROFESIONAL" && actor.id === cita.profesional.usuarioId;
    if (!esClientePropietario && !esProfesionalAsignado) {
      throw crearError("Solo el cliente o profesional asignado pueden cancelar la cita", StatusCodes.FORBIDDEN);
    }
    if (!data.motivo?.trim()) {
      throw crearError("Debe indicar un motivo al cancelar una cita aceptada", StatusCodes.BAD_REQUEST);
    }
  } else if (estadoActual === "ACEPTADA" && estadoNuevo === "COMPLETADA") {
    if (data.actorRol !== "PROFESIONAL" || actor.id !== cita.profesional.usuarioId) {
      throw crearError("Solo el profesional asignado puede completar la cita", StatusCodes.FORBIDDEN);
    }

    const fechaHoraProgramada = construirFechaHora(cita.fechaCita, cita.horaInicio);
    if (new Date() < fechaHoraProgramada) {
      throw crearError("No se puede completar la cita antes de la fecha y hora programadas", StatusCodes.BAD_REQUEST);
    }
  } else {
    throw crearError("La transicion solicitada no esta permitida por la matriz de estados", StatusCodes.BAD_REQUEST);
  }

  return prisma.$transaction(async (tx) => {
    const citaActualizada = await tx.cita.update({
      where: { id },
      data: {
        estado: estadoNuevo,
        comentarioProfesional: data.comentarioProfesional ?? undefined,
      },
    });

    await tx.historialCita.create({
      data: {
        citaId: id,
        estadoAnterior: estadoActual,
        estadoNuevo,
        motivo: data.motivo,
        cambiadoPorId: actor.id,
      },
    });

    return citaActualizada;
  });
};

const cancelCita = async (id: number) => {
  const cita = await prisma.cita.findUnique({ where: { id } });
  if (!cita) {
    throw crearError("Cita no encontrada", StatusCodes.NOT_FOUND);
  }

  if (!["PENDIENTE", "ACEPTADA"].includes(cita.estado)) {
    throw crearError("Solo se pueden cancelar citas en estado PENDIENTE o ACEPTADA", StatusCodes.BAD_REQUEST);
  }

  return prisma.cita.update({
    where: { id },
    data: { estado: "CANCELADA" },
  });
};

export default {
  getAllCitas,
  getCitaById,
  createCita,
  updateCita,
  cambiarEstadoCita,
  cancelCita,
};

import { prisma } from '../config/prisma';
import type { CreateProfesionalDTO, UpdateProfesionalDTO } from '../dtos/profesional.dto';

interface GetProfesionalesFilters {
  search?: string;
  modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
  disponible?: boolean;
}

const getAllProfesionales = async (filters: GetProfesionalesFilters = {}) => {
  return prisma.perfilProfesional.findMany({
    where: {
      modalidad: filters.modalidad,
      disponible: filters.disponible,
      usuario: filters.search
        ? {
            OR: [
              { nombre: { contains: filters.search } },
              { apellidos: { contains: filters.search } },
            ],
          }
        : undefined,
    },
    include: {
      usuario: true,
      especialidades: {
        include: {
          especialidad: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getProfesionalById = async (id: number) => {
  const perfil = await prisma.perfilProfesional.findUnique({
    where: { id },
    include: {
      usuario: true,
      especialidades: {
        include: {
          especialidad: true,
        },
      },
      servicios: {
        include: {
          categoria: true,
        },
      },
      resenas: {
        select: { puntuacion: true },
      },
    },
  });

  if (!perfil) {
    return null;
  }

  // La calificacion promedio ya se calculaba en el reporte de admin
  // (Calificaciones de Profesionales); tambien se expone aca para que se
  // vea directamente en el perfil publico del profesional, no solo en
  // reportes.
  const cantidadResenas = perfil.resenas.length;
  const promedioCalificacion =
    cantidadResenas > 0
      ? perfil.resenas.reduce((suma, r) => suma + r.puntuacion, 0) / cantidadResenas
      : null;

  const { resenas, ...resto } = perfil;
  return { ...resto, promedioCalificacion, cantidadResenas };
};

const createProfesional = async (data: CreateProfesionalDTO) => {
  return prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
        email: data.email,
        password: data.password,
        telefono: data.telefono,
        imagenPerfil: data.imagenPerfil,
        rol: 'PROFESIONAL',
        estado: 'ACTIVO',
      },
    });

    const perfil = await tx.perfilProfesional.create({
      data: {
        usuarioId: usuario.id,
        tituloProfesional: data.tituloProfesional,
        descripcion: data.descripcion,
        aniosExperiencia: data.aniosExperiencia,
        modalidad: data.modalidad,
        provincia: data.provincia,
        canton: data.canton,
        distrito: data.distrito,
        tarifaBase: data.tarifaBase,
        disponible: data.disponible ?? true,
        imagenPerfil: data.imagenPerfil ?? 'perfil-not-found.png',
      },
      include: {
        usuario: true,
      },
    });

    if (data.especialidadIds?.length) {
      await tx.especialidadProfesional.createMany({
        data: data.especialidadIds.map((especialidadId) => ({
          perfilProfesionalId: perfil.id,
          especialidadId,
        })),
      });
    }

    return perfil;
  });
};

const updateProfesional = async (id: number, data: UpdateProfesionalDTO) => {
  const perfilActual = await prisma.perfilProfesional.findUnique({
    where: { id },
    include: { usuario: true },
  });

  if (!perfilActual) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (data.nombre || data.apellidos || data.email || data.telefono || data.imagenPerfil) {
      await tx.usuario.update({
        where: { id: perfilActual.usuarioId },
        data: {
          nombre: data.nombre,
          apellidos: data.apellidos,
          email: data.email,
          telefono: data.telefono,
          // La cuenta (Usuario) tambien guarda su propia foto para mostrarla
          // en "Mi cuenta"; se mantiene sincronizada con la que se sube
          // desde el perfil profesional publico para que ambas coincidan.
          imagenPerfil: data.imagenPerfil,
        },
      });
    }

    const perfil = await tx.perfilProfesional.update({
      where: { id },
      data: {
        tituloProfesional: data.tituloProfesional,
        descripcion: data.descripcion,
        aniosExperiencia: data.aniosExperiencia,
        modalidad: data.modalidad,
        provincia: data.provincia,
        canton: data.canton,
        distrito: data.distrito,
        tarifaBase: data.tarifaBase,
        disponible: data.disponible,
        imagenPerfil: data.imagenPerfil,
      },
      include: {
        usuario: true,
      },
    });

    if (data.especialidadIds) {
      await tx.especialidadProfesional.deleteMany({
        where: { perfilProfesionalId: id },
      });

      if (data.especialidadIds.length) {
        await tx.especialidadProfesional.createMany({
          data: data.especialidadIds.map((especialidadId) => ({
            perfilProfesionalId: id,
            especialidadId,
          })),
        });
      }
    }

    return perfil;
  });
};

const setDisponibilidad = async (id: number, disponible: boolean) => {
  return prisma.perfilProfesional.update({
    where: { id },
    data: { disponible },
  });
};

export default {
  getAllProfesionales,
  getProfesionalById,
  createProfesional,
  updateProfesional,
  setDisponibilidad,
};

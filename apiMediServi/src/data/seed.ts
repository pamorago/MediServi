import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "mediservi",
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seeders...");

  await prisma.historialCita.deleteMany();
  await prisma.cita.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.especialidadProfesional.deleteMany();
  await prisma.especialidadServicio.deleteMany();
  await prisma.perfilProfesional.deleteMany();
  await prisma.especialidad.deleteMany();
  await prisma.categoriaServicio.deleteMany();
  await prisma.usuario.deleteMany();

  const usuarios = await prisma.usuario.createMany({
    data: [
      {
        nombre: "Admin",
        apellidos: "MediServi",
        email: "admin@mediservi.com",
        password: await bcrypt.hash("Admin1234", 10),
        telefono: "12345678",
        rol: "ADMINISTRADOR",
      },
      {
        nombre: "Cliente",
        apellidos: "Prueba",
        email: "cliente@mediservi.com",
        password: await bcrypt.hash("Cliente1234", 10),
        telefono: "87654321",
        rol: "CLIENTE",
      },
      {
        nombre: "Profesional",
        apellidos: "Salud",
        email: "pro@mediservi.com",
        password: await bcrypt.hash("Pro1234", 10),
        telefono: "55555555",
        rol: "PROFESIONAL",
      },
    ],
  });

  const admin = await prisma.usuario.findUnique({ where: { email: "admin@mediservi.com" } });
  const cliente = await prisma.usuario.findUnique({ where: { email: "cliente@mediservi.com" } });
  const profesional = await prisma.usuario.findUnique({ where: { email: "pro@mediservi.com" } });

  if (!admin || !cliente || !profesional) {
    throw new Error("No se pudo crear usuarios iniciales");
  }

  const categorias = await prisma.categoriaServicio.createMany({
    data: [
      { nombre: "Telemedicina", descripcion: "Consultas médicas a distancia" },
      { nombre: "Nutrición", descripcion: "Servicios de nutrición y dietética" },
      { nombre: "Psicología", descripcion: "Consultas psicológicas" },
    ],
  });

  const especialidades = await prisma.especialidad.createMany({
    data: [
      { nombre: "Medicina General", descripcion: "Atención primaria para adultos y niños" },
      { nombre: "Nutrición Clínica", descripcion: "Soporte nutricional y planes alimentarios" },
      { nombre: "Psicoterapia", descripcion: "Apoyo emocional y terapias psicológicas" },
    ],
  });

  const perfilProfesional = await prisma.perfilProfesional.create({
    data: {
      usuarioId: profesional.id,
      tituloProfesional: "Médico General",
      descripcion: "Profesional con experiencia en atención primaria y teleconsulta.",
      aniosExperiencia: 5,
      modalidad: "MIXTA",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      tarifaBase: 35000.0,
      disponible: true,
      imagenPerfil: "perfil-pro.png",
    },
  });

  const categoria = await prisma.categoriaServicio.findUnique({ where: { nombre: "Telemedicina" } });
  const especialidadClinica = await prisma.especialidad.findUnique({ where: { nombre: "Medicina General" } });
  const especialidadNutricion = await prisma.especialidad.findUnique({ where: { nombre: "Nutrición Clínica" } });

  if (!categoria || !especialidadClinica || !especialidadNutricion) {
    throw new Error("No se pudo crear datos de categorías o especialidades");
  }

  const servicio = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilProfesional.id,
      categoriaId: categoria.id,
      nombre: "Consulta médica general",
      descripcion: "Consulta en línea o presencial para valoración general.",
      precio: 50000.0,
      duracionMinutos: 45,
      modalidad: "MIXTA",
    },
  });

  await prisma.especialidadProfesional.create({
    data: {
      perfilProfesionalId: perfilProfesional.id,
      especialidadId: especialidadClinica.id,
    },
  });

  await prisma.especialidadServicio.create({
    data: {
      servicioId: servicio.id,
      especialidadId: especialidadClinica.id,
    },
  });

  await prisma.especialidadServicio.create({
    data: {
      servicioId: servicio.id,
      especialidadId: especialidadNutricion.id,
    },
  });

  await prisma.cita.create({
    data: {
      clienteId: cliente.id,
      servicioId: servicio.id,
      perfilProfesionalId: perfilProfesional.id,
      fechaCita: new Date(),
      horaInicio: new Date("1970-01-01T09:00:00"),
      horaFin: new Date("1970-01-01T09:45:00"),
      modalidad: "VIRTUAL",
      montoEstimado: 50000.0,
      comentarioCliente: "Necesito revisión general",
    },
  });

  console.log("Seeders completados con éxito.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

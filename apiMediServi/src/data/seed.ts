import "dotenv/config";
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

  // ── 1. Limpieza en orden inverso de dependencias ──────────────────────────
  await prisma.resena.deleteMany();
  await prisma.historialCita.deleteMany();
  await prisma.cita.deleteMany();
  await prisma.especialidadServicio.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.especialidadProfesional.deleteMany();
  await prisma.perfilProfesional.deleteMany();
  await prisma.especialidad.deleteMany();
  await prisma.categoriaServicio.deleteMany();
  await prisma.usuario.deleteMany();
  console.log("  Limpieza completada.");

  // ── 2. Usuarios ───────────────────────────────────────────────────────────
  await prisma.usuario.createMany({
    data: [
      {
        nombre: "Admin",
        apellidos: "MediServi",
        email: "admin@mediservi.com",
        password: await bcrypt.hash("Admin1234!", 10),
        telefono: "22000000",
        rol: "ADMINISTRADOR",
      },
      {
        nombre: "Ana",
        apellidos: "Rodríguez Mora",
        email: "ana@mediservi.com",
        password: await bcrypt.hash("Cliente1234!", 10),
        telefono: "88001122",
        rol: "CLIENTE",
      },
      {
        nombre: "Carlos",
        apellidos: "Méndez Solano",
        email: "carlos@mediservi.com",
        password: await bcrypt.hash("Cliente5678!", 10),
        telefono: "88334455",
        rol: "CLIENTE",
      },
      {
        nombre: "Laura",
        apellidos: "Jiménez Castro",
        email: "laura.jimenez@mediservi.com",
        password: await bcrypt.hash("Pro1234!", 10),
        telefono: "70112233",
        rol: "PROFESIONAL",
      },
      {
        nombre: "Pedro",
        apellidos: "Vargas Ulate",
        email: "pedro.vargas@mediservi.com",
        password: await bcrypt.hash("Pro5678!", 10),
        telefono: "70445566",
        rol: "PROFESIONAL",
      },
      {
        nombre: "María",
        apellidos: "Solís Badilla",
        email: "maria.solis@mediservi.com",
        password: await bcrypt.hash("Pro9012!", 10),
        telefono: "70778899",
        rol: "PROFESIONAL",
      },
    ],
  });

  // ── 3. Categorías de servicio ─────────────────────────────────────────────
  await prisma.categoriaServicio.createMany({
    data: [
      { nombre: "Medicina General", descripcion: "Consultas de atención primaria para adultos y niños." },
      { nombre: "Pediatría", descripcion: "Atención médica especializada para niños y adolescentes." },
      { nombre: "Psicología", descripcion: "Servicios de salud mental y terapia psicológica." },
      { nombre: "Nutrición y Dietética", descripcion: "Planes alimentarios y orientación nutricional." },
      { nombre: "Dermatología", descripcion: "Diagnóstico y tratamiento de enfermedades de la piel." },
      { nombre: "Fisioterapia", descripcion: "Rehabilitación física y manejo del dolor." },
    ],
  });

  // ── 4. Especialidades ─────────────────────────────────────────────────────
  await prisma.especialidad.createMany({
    data: [
      { nombre: "Medicina General", descripcion: "Atención primaria integral para todas las edades." },
      { nombre: "Pediatría", descripcion: "Salud infantil y del adolescente." },
      { nombre: "Psicología Clínica", descripcion: "Evaluación y terapia psicológica." },
      { nombre: "Nutrición Clínica", descripcion: "Soporte nutricional y planes alimentarios personalizados." },
      { nombre: "Dermatología Clínica", descripcion: "Tratamiento de afecciones dermatológicas." },
      { nombre: "Fisioterapia y Rehabilitación", descripcion: "Recuperación funcional y manejo del dolor crónico." },
    ],
  });

  // ── 5. Recuperar mapas indexados ──────────────────────────────────────────
  const [cats, specs, users] = await Promise.all([
    prisma.categoriaServicio.findMany(),
    prisma.especialidad.findMany(),
    prisma.usuario.findMany(),
  ]);

  const catMap = Object.fromEntries(cats.map((c) => [c.nombre, c.id]));
  const specMap = Object.fromEntries(specs.map((s) => [s.nombre, s.id]));
  const userMap = Object.fromEntries(users.map((u) => [u.email, u.id]));

  // ── 6. Perfiles profesionales ─────────────────────────────────────────────
  const perfilLaura = await prisma.perfilProfesional.create({
    data: {
      usuarioId: userMap["laura.jimenez@mediservi.com"],
      tituloProfesional: "Médico General",
      descripcion: "Médico con más de 8 años de experiencia en atención primaria, teleconsulta y urgencias menores.",
      aniosExperiencia: 8,
      modalidad: "MIXTA",
      provincia: "San José",
      canton: "Central",
      distrito: "Carmen",
      tarifaBase: 25000,
      disponible: true,
      imagenPerfil: "perfil-laura.png",
    },
  });

  const perfilPedro = await prisma.perfilProfesional.create({
    data: {
      usuarioId: userMap["pedro.vargas@mediservi.com"],
      tituloProfesional: "Psicólogo Clínico",
      descripcion: "Especialista en terapia cognitivo-conductual, manejo de ansiedad, depresión y trauma.",
      aniosExperiencia: 6,
      modalidad: "VIRTUAL",
      provincia: "Heredia",
      canton: "Central",
      distrito: "Ulloa",
      tarifaBase: 35000,
      disponible: true,
      imagenPerfil: "perfil-pedro.png",
    },
  });

  const perfilMaria = await prisma.perfilProfesional.create({
    data: {
      usuarioId: userMap["maria.solis@mediservi.com"],
      tituloProfesional: "Nutricionista-Dietista",
      descripcion: "Experta en nutrición clínica, pérdida de peso saludable y manejo de enfermedades metabólicas.",
      aniosExperiencia: 4,
      modalidad: "MIXTA",
      provincia: "Alajuela",
      canton: "Central",
      distrito: "San José",
      tarifaBase: 20000,
      disponible: true,
      imagenPerfil: "perfil-maria.png",
    },
  });

  // ── 7. Especialidades por profesional ────────────────────────────────────
  await prisma.especialidadProfesional.createMany({
    data: [
      { perfilProfesionalId: perfilLaura.id, especialidadId: specMap["Medicina General"] },
      { perfilProfesionalId: perfilLaura.id, especialidadId: specMap["Pediatría"] },
      { perfilProfesionalId: perfilPedro.id, especialidadId: specMap["Psicología Clínica"] },
      { perfilProfesionalId: perfilMaria.id, especialidadId: specMap["Nutrición Clínica"] },
    ],
  });

  // ── 8. Servicios ──────────────────────────────────────────────────────────
  const svcConsultaGeneral = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilLaura.id,
      categoriaId: catMap["Medicina General"],
      nombre: "Consulta médica general",
      descripcion: "Valoración integral del estado de salud del paciente, diagnóstico y orientación terapéutica.",
      precio: 25000,
      duracionMinutos: 45,
      modalidad: "MIXTA",
    },
  });

  const svcConsultaPediatria = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilLaura.id,
      categoriaId: catMap["Pediatría"],
      nombre: "Consulta pediátrica",
      descripcion: "Atención médica especializada para niños de 0 a 15 años, control de crecimiento y vacunas.",
      precio: 30000,
      duracionMinutos: 40,
      modalidad: "PRESENCIAL",
    },
  });

  const svcSesionPsicologica = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilPedro.id,
      categoriaId: catMap["Psicología"],
      nombre: "Sesión psicológica individual",
      descripcion: "Terapia individual enfocada en salud mental, manejo del estrés, ansiedad y depresión.",
      precio: 40000,
      duracionMinutos: 50,
      modalidad: "VIRTUAL",
    },
  });

  const svcTerapiaGrupal = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilPedro.id,
      categoriaId: catMap["Psicología"],
      nombre: "Terapia grupal",
      descripcion: "Sesión grupal facilitada por psicólogo para el manejo colaborativo de problemáticas comunes.",
      precio: 18000,
      duracionMinutos: 90,
      modalidad: "PRESENCIAL",
    },
  });

  const svcConsultaNutricional = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilMaria.id,
      categoriaId: catMap["Nutrición y Dietética"],
      nombre: "Consulta nutricional inicial",
      descripcion: "Evaluación nutricional completa y elaboración de un plan alimentario personalizado.",
      precio: 20000,
      duracionMinutos: 60,
      modalidad: "MIXTA",
    },
  });

  const svcSeguimientoNutricional = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilMaria.id,
      categoriaId: catMap["Nutrición y Dietética"],
      nombre: "Seguimiento nutricional",
      descripcion: "Sesión de seguimiento para ajuste del plan alimentario y revisión de objetivos.",
      precio: 15000,
      duracionMinutos: 30,
      modalidad: "VIRTUAL",
    },
  });

  // ── 9. Especialidades por servicio ────────────────────────────────────────
  await prisma.especialidadServicio.createMany({
    data: [
      { servicioId: svcConsultaGeneral.id, especialidadId: specMap["Medicina General"] },
      { servicioId: svcConsultaPediatria.id, especialidadId: specMap["Pediatría"] },
      { servicioId: svcSesionPsicologica.id, especialidadId: specMap["Psicología Clínica"] },
      { servicioId: svcTerapiaGrupal.id, especialidadId: specMap["Psicología Clínica"] },
      { servicioId: svcConsultaNutricional.id, especialidadId: specMap["Nutrición Clínica"] },
      { servicioId: svcSeguimientoNutricional.id, especialidadId: specMap["Nutrición Clínica"] },
    ],
  });

  // ── 10. Citas ─────────────────────────────────────────────────────────────
  const fecha = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const hora = (h: number, m = 0) => new Date(`1970-01-01T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);

  const citaCompletada = await prisma.cita.create({
    data: {
      clienteId: userMap["ana@mediservi.com"],
      servicioId: svcConsultaGeneral.id,
      perfilProfesionalId: perfilLaura.id,
      fechaCita: fecha(-10),
      horaInicio: hora(9),
      horaFin: hora(9, 45),
      modalidad: "VIRTUAL",
      montoEstimado: 25000,
      estado: "COMPLETADA",
      comentarioCliente: "Tengo tos persistente y fiebre leve desde hace tres días.",
      comentarioProfesional: "Paciente con cuadro viral. Se indicó reposo y medicación sintomática.",
    },
  });

  const citaAceptada = await prisma.cita.create({
    data: {
      clienteId: userMap["ana@mediservi.com"],
      servicioId: svcSesionPsicologica.id,
      perfilProfesionalId: perfilPedro.id,
      fechaCita: fecha(3),
      horaInicio: hora(10),
      horaFin: hora(10, 50),
      modalidad: "VIRTUAL",
      montoEstimado: 40000,
      estado: "ACEPTADA",
      comentarioCliente: "Busco apoyo para manejar el estrés laboral.",
    },
  });

  const citaPendiente = await prisma.cita.create({
    data: {
      clienteId: userMap["carlos@mediservi.com"],
      servicioId: svcConsultaNutricional.id,
      perfilProfesionalId: perfilMaria.id,
      fechaCita: fecha(7),
      horaInicio: hora(14),
      horaFin: hora(15),
      modalidad: "MIXTA",
      montoEstimado: 20000,
      estado: "PENDIENTE",
      comentarioCliente: "Quiero iniciar un plan para bajar de peso de forma saludable.",
    },
  });

  const citaCancelada = await prisma.cita.create({
    data: {
      clienteId: userMap["carlos@mediservi.com"],
      servicioId: svcConsultaPediatria.id,
      perfilProfesionalId: perfilLaura.id,
      fechaCita: fecha(-5),
      horaInicio: hora(11),
      horaFin: hora(11, 40),
      modalidad: "PRESENCIAL",
      montoEstimado: 30000,
      estado: "CANCELADA",
      comentarioCliente: "Consulta para mi hijo de 6 años.",
    },
  });

  const citaCompletada2 = await prisma.cita.create({
    data: {
      clienteId: userMap["carlos@mediservi.com"],
      servicioId: svcSeguimientoNutricional.id,
      perfilProfesionalId: perfilMaria.id,
      fechaCita: fecha(-3),
      horaInicio: hora(16),
      horaFin: hora(16, 30),
      modalidad: "VIRTUAL",
      montoEstimado: 15000,
      estado: "COMPLETADA",
      comentarioCliente: "Seguimiento de mi plan alimentario del mes pasado.",
      comentarioProfesional: "Buen progreso. Se ajustaron macros y se amplió variedad de alimentos.",
    },
  });

  // ── 11. Historial de citas ────────────────────────────────────────────────
  await prisma.historialCita.createMany({
    data: [
      {
        citaId: citaCompletada.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "ACEPTADA",
        motivo: "Profesional confirmó disponibilidad.",
        cambiadoPorId: perfilLaura.usuarioId,
      },
      {
        citaId: citaCompletada.id,
        estadoAnterior: "ACEPTADA",
        estadoNuevo: "COMPLETADA",
        motivo: "Consulta realizada satisfactoriamente.",
        cambiadoPorId: perfilLaura.usuarioId,
      },
      {
        citaId: citaAceptada.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "ACEPTADA",
        motivo: "Sesión confirmada por el psicólogo.",
        cambiadoPorId: perfilPedro.usuarioId,
      },
      {
        citaId: citaCancelada.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "CANCELADA",
        motivo: "El cliente canceló por cambio de agenda.",
        cambiadoPorId: userMap["carlos@mediservi.com"],
      },
      {
        citaId: citaCompletada2.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "ACEPTADA",
        motivo: "Nutricionista confirmó la sesión de seguimiento.",
        cambiadoPorId: perfilMaria.usuarioId,
      },
      {
        citaId: citaCompletada2.id,
        estadoAnterior: "ACEPTADA",
        estadoNuevo: "COMPLETADA",
        motivo: "Sesión de seguimiento realizada.",
        cambiadoPorId: perfilMaria.usuarioId,
      },
    ],
  });

  // ── 12. Reseñas (solo citas COMPLETADAS) ──────────────────────────────────
  await prisma.resena.createMany({
    data: [
      {
        citaId: citaCompletada.id,
        perfilProfesionalId: perfilLaura.id,
        puntuacion: 5,
        comentario: "Excelente atención. La doctora fue muy clara y amable. Totalmente recomendada.",
      },
      {
        citaId: citaCompletada2.id,
        perfilProfesionalId: perfilMaria.id,
        puntuacion: 4,
        comentario: "Muy buena orientación nutricional. El plan es detallado y fácil de seguir.",
      },
    ],
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

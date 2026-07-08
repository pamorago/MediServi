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
        estado: "INACTIVO",
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
      {
        nombre: "Jorge",
        apellidos: "Ramírez Soto",
        email: "jorge.ramirez@mediservi.com",
        password: await bcrypt.hash("Pro3456!", 10),
        telefono: "70661122",
        rol: "PROFESIONAL",
      },
      {
        nombre: "Elena",
        apellidos: "Quesada Rojas",
        email: "elena.quesada@mediservi.com",
        password: await bcrypt.hash("Pro7890!", 10),
        telefono: "70553344",
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
      { nombre: "Cardiología", descripcion: "Prevención y control de riesgo cardiovascular." , estado: "INACTIVO"},
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
      { nombre: "Dermatología Estética", descripcion: "Protocolos de cuidado dermatológico no invasivo." },
      { nombre: "Cardiología Clínica", descripcion: "Control integral de factores de riesgo cardiometabólico.", estado: "INACTIVO" },
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

  const perfilJorge = await prisma.perfilProfesional.create({
    data: {
      usuarioId: userMap["jorge.ramirez@mediservi.com"],
      tituloProfesional: "Dermatólogo",
      descripcion: "Dermatólogo clínico enfocado en diagnóstico temprano y manejo integral de enfermedades de la piel.",
      aniosExperiencia: 9,
      modalidad: "PRESENCIAL",
      provincia: "Cartago",
      canton: "Central",
      distrito: "Oriental",
      tarifaBase: 38000,
      disponible: true,
      imagenPerfil: "perfil-jorge.png",
    },
  });

  const perfilElena = await prisma.perfilProfesional.create({
    data: {
      usuarioId: userMap["elena.quesada@mediservi.com"],
      tituloProfesional: "Fisioterapeuta",
      descripcion: "Fisioterapeuta con enfoque en rehabilitación funcional, recuperación postquirúrgica y dolor crónico.",
      aniosExperiencia: 7,
      modalidad: "MIXTA",
      provincia: "San José",
      canton: "Escazú",
      distrito: "San Rafael",
      tarifaBase: 28000,
      disponible: false,
      imagenPerfil: "perfil-elena.png",
    },
  });

  // ── 7. Especialidades por profesional ────────────────────────────────────
  await prisma.especialidadProfesional.createMany({
    data: [
      { perfilProfesionalId: perfilLaura.id, especialidadId: specMap["Medicina General"] },
      { perfilProfesionalId: perfilLaura.id, especialidadId: specMap["Pediatría"] },
      { perfilProfesionalId: perfilPedro.id, especialidadId: specMap["Psicología Clínica"] },
      { perfilProfesionalId: perfilMaria.id, especialidadId: specMap["Nutrición Clínica"] },
      { perfilProfesionalId: perfilJorge.id, especialidadId: specMap["Dermatología Clínica"] },
      { perfilProfesionalId: perfilJorge.id, especialidadId: specMap["Dermatología Estética"] },
      { perfilProfesionalId: perfilElena.id, especialidadId: specMap["Fisioterapia y Rehabilitación"] },
      { perfilProfesionalId: perfilElena.id, especialidadId: specMap["Cardiología Clínica"] },
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

  const svcConsultaDermatologia = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilJorge.id,
      categoriaId: catMap["Dermatología"],
      nombre: "Consulta dermatológica",
      descripcion: "Evaluación diagnóstica de lesiones cutáneas, acné, dermatitis y seguimiento terapéutico.",
      precio: 38000,
      duracionMinutos: 45,
      modalidad: "PRESENCIAL",
    },
  });

  const svcControlDermatologia = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilJorge.id,
      categoriaId: catMap["Dermatología"],
      nombre: "Control dermatológico",
      descripcion: "Cita de control para ajuste de tratamiento y evolución clínica.",
      precio: 25000,
      duracionMinutos: 30,
      modalidad: "VIRTUAL",
      estado: "INACTIVO",
    },
  });

  const svcFisioterapiaFuncional = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilElena.id,
      categoriaId: catMap["Fisioterapia"],
      nombre: "Sesión de fisioterapia funcional",
      descripcion: "Rehabilitación personalizada para recuperación de movilidad, fuerza y equilibrio post lesión.",
      precio: 28000,
      duracionMinutos: 60,
      modalidad: "PRESENCIAL",
    },
  });

  const svcTerapiaDolor = await prisma.servicio.create({
    data: {
      perfilProfesionalId: perfilElena.id,
      categoriaId: catMap["Fisioterapia"],
      nombre: "Terapia para manejo del dolor",
      descripcion: "Intervención para dolor musculoesquelético crónico con ejercicios y educación terapéutica.",
      precio: 24000,
      duracionMinutos: 50,
      modalidad: "MIXTA",
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
      { servicioId: svcConsultaDermatologia.id, especialidadId: specMap["Dermatología Clínica"] },
      { servicioId: svcControlDermatologia.id, especialidadId: specMap["Dermatología Estética"] },
      { servicioId: svcFisioterapiaFuncional.id, especialidadId: specMap["Fisioterapia y Rehabilitación"] },
      { servicioId: svcTerapiaDolor.id, especialidadId: specMap["Cardiología Clínica"] },
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

  const citaPendiente2 = await prisma.cita.create({
    data: {
      clienteId: userMap["ana@mediservi.com"],
      servicioId: svcConsultaDermatologia.id,
      perfilProfesionalId: perfilJorge.id,
      fechaCita: fecha(5),
      horaInicio: hora(8),
      horaFin: hora(8, 45),
      modalidad: "PRESENCIAL",
      montoEstimado: 38000,
      estado: "PENDIENTE",
      comentarioCliente: "Revisión por manchas nuevas en la piel.",
    },
  });

  const citaPendiente3 = await prisma.cita.create({
    data: {
      clienteId: userMap["carlos@mediservi.com"],
      servicioId: svcFisioterapiaFuncional.id,
      perfilProfesionalId: perfilElena.id,
      fechaCita: fecha(8),
      horaInicio: hora(15),
      horaFin: hora(16),
      modalidad: "PRESENCIAL",
      montoEstimado: 28000,
      estado: "PENDIENTE",
      comentarioCliente: "Rehabilitación de rodilla derecha.",
    },
  });

  const citaAceptada2 = await prisma.cita.create({
    data: {
      clienteId: userMap["ana@mediservi.com"],
      servicioId: svcTerapiaDolor.id,
      perfilProfesionalId: perfilElena.id,
      fechaCita: fecha(10),
      horaInicio: hora(11),
      horaFin: hora(11, 50),
      modalidad: "MIXTA",
      montoEstimado: 24000,
      estado: "ACEPTADA",
      comentarioCliente: "Dolor lumbar recurrente post jornada laboral.",
    },
  });

  const citaCompletada3 = await prisma.cita.create({
    data: {
      clienteId: userMap["carlos@mediservi.com"],
      servicioId: svcConsultaGeneral.id,
      perfilProfesionalId: perfilLaura.id,
      fechaCita: fecha(-15),
      horaInicio: hora(13),
      horaFin: hora(13, 45),
      modalidad: "PRESENCIAL",
      montoEstimado: 25000,
      estado: "COMPLETADA",
      comentarioCliente: "Control de presión arterial y síntomas de fatiga.",
      comentarioProfesional: "Se solicita laboratorio de control y ajustes en hábitos de sueño.",
    },
  });

  const citaCancelada2 = await prisma.cita.create({
    data: {
      clienteId: userMap["ana@mediservi.com"],
      servicioId: svcSeguimientoNutricional.id,
      perfilProfesionalId: perfilMaria.id,
      fechaCita: fecha(-1),
      horaInicio: hora(17),
      horaFin: hora(17, 30),
      modalidad: "VIRTUAL",
      montoEstimado: 15000,
      estado: "CANCELADA",
      comentarioCliente: "No podré asistir por viaje laboral.",
    },
  });

  const citaPendiente4 = await prisma.cita.create({
    data: {
      clienteId: userMap["carlos@mediservi.com"],
      servicioId: svcSesionPsicologica.id,
      perfilProfesionalId: perfilPedro.id,
      fechaCita: fecha(12),
      horaInicio: hora(9),
      horaFin: hora(9, 50),
      modalidad: "VIRTUAL",
      montoEstimado: 40000,
      estado: "PENDIENTE",
      comentarioCliente: "Seguimiento por estrés y ansiedad.",
    },
  });

  const citaPendiente5 = await prisma.cita.create({
    data: {
      clienteId: userMap["ana@mediservi.com"],
      servicioId: svcConsultaNutricional.id,
      perfilProfesionalId: perfilMaria.id,
      fechaCita: fecha(14),
      horaInicio: hora(10),
      horaFin: hora(11),
      modalidad: "MIXTA",
      montoEstimado: 20000,
      estado: "PENDIENTE",
      comentarioCliente: "Quiero mejorar hábitos alimentarios para control metabólico.",
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
      {
        citaId: citaAceptada2.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "ACEPTADA",
        motivo: "Profesional confirma espacio en agenda.",
        cambiadoPorId: perfilElena.usuarioId,
      },
      {
        citaId: citaCancelada2.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "CANCELADA",
        motivo: "Cliente reporta imposibilidad de conexión.",
        cambiadoPorId: userMap["ana@mediservi.com"],
      },
      {
        citaId: citaCompletada3.id,
        estadoAnterior: "PENDIENTE",
        estadoNuevo: "ACEPTADA",
        motivo: "Se confirma cita médica de control.",
        cambiadoPorId: perfilLaura.usuarioId,
      },
      {
        citaId: citaCompletada3.id,
        estadoAnterior: "ACEPTADA",
        estadoNuevo: "COMPLETADA",
        motivo: "Consulta finalizada con éxito.",
        cambiadoPorId: perfilLaura.usuarioId,
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
      {
        citaId: citaCompletada3.id,
        perfilProfesionalId: perfilLaura.id,
        puntuacion: 5,
        comentario: "Excelente seguimiento clínico y recomendaciones claras para mejorar mis indicadores.",
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

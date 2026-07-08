import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import categoriaRoutes from "./categoria.routes";
import especialidadRoutes from "./especialidad.routes";
import citaRoutes from "./cita.routes";
import profesionalRoutes from "./profesional.routes";
import servicioRoutes from "./servicio.routes";

const router = Router();

router.use("/usuarios", usuarioRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/especialidades", especialidadRoutes);
router.use("/profesionales", profesionalRoutes);
router.use("/servicios", servicioRoutes);
router.use("/citas", citaRoutes);

export default router;

import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import categoriaRoutes from "./categoria.routes";
import especialidadRoutes from "./especialidad.routes";
import citaRoutes from "./cita.routes";
import profesionalRoutes from "./profesional.routes";
import servicioRoutes from "./servicio.routes";
import imagenRoutes from "./imagen.routes";

const router = Router();

router.use("/usuarios", usuarioRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/especialidades", especialidadRoutes);
router.use("/profesionales", profesionalRoutes);
router.use("/servicios", servicioRoutes);
router.use("/citas", citaRoutes);
router.use("/imagenes", imagenRoutes);

export default router;

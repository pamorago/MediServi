import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import categoriaRoutes from "./categoria.routes";
import especialidadRoutes from "./especialidad.routes";
import citaRoutes from "./cita.routes";

const router = Router();

router.use("/usuarios", usuarioRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/especialidades", especialidadRoutes);
router.use("/citas", citaRoutes);

export default router;

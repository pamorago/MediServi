import { Router } from "express";
import especialidadController from "../controllers/especialidad.controller";

const router = Router();

router.get("/", especialidadController.getEspecialidades);
router.get("/:id", especialidadController.getEspecialidad);
router.post("/", especialidadController.createEspecialidad);
router.put("/:id", especialidadController.updateEspecialidad);
router.patch("/:id/estado", especialidadController.setEstadoEspecialidad);
router.delete("/:id", especialidadController.deleteEspecialidad);

export default router;

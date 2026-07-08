import { Router } from "express";
import citaController from "../controllers/cita.controller";

const router = Router();

router.get("/", citaController.getCitas);
router.get("/:id", citaController.getCita);
router.post("/", citaController.createCita);
router.put("/:id", citaController.updateCita);
router.delete("/:id", citaController.deleteCita);

export default router;

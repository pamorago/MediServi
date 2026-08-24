import { Router } from "express";
import citaController from "../controllers/cita.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", citaController.getCitas);
router.get("/:id", citaController.getCita);
// Solo un CLIENTE puede solicitar una cita (y siempre a su propio nombre);
// requiere verifyJWT para que el controlador pueda saber con certeza el rol
// de quien hace la peticion, en vez de confiar en lo que mande el body.
router.post("/", verifyJWT, citaController.createCita);
router.put("/:id", citaController.updateCita);
router.patch("/:id/estado", citaController.cambiarEstadoCita);
router.delete("/:id", citaController.deleteCita);

export default router;

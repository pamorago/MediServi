import { Router } from "express";
import usuarioController from "../controllers/usuario.controller";

const router = Router();

router.get("/", usuarioController.getUsuarios);
router.get("/:id", usuarioController.getUsuario);
router.post("/", usuarioController.createUsuario);
router.put("/:id", usuarioController.updateUsuario);
router.patch("/:id/estado", usuarioController.setEstadoUsuario);
router.delete("/:id", usuarioController.deleteUsuario);

export default router;

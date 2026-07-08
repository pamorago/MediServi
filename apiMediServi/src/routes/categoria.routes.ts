import { Router } from "express";
import categoriaController from "../controllers/categoria.controller";

const router = Router();

router.get("/", categoriaController.getCategorias);
router.get("/:id", categoriaController.getCategoria);
router.post("/", categoriaController.createCategoria);
router.put("/:id", categoriaController.updateCategoria);
router.patch("/:id/estado", categoriaController.setEstadoCategoria);
router.delete("/:id", categoriaController.deleteCategoria);

export default router;

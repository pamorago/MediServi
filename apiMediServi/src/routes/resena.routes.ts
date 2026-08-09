import { Router } from "express";
import resenaController from "../controllers/resena.controller";

const router = Router();

router.get("/", resenaController.getResenas);
router.post("/", resenaController.createResena);

export default router;

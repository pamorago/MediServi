/**
 * Rutas de Autenticación - MediServi
 */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

/**
 * POST /auth/login
 * Login con email y contraseña
 */
router.post("/login", AuthController.login);

/**
 * POST /auth/register
 * Registro público de nuevos clientes
 */
router.post("/register", AuthController.register);

/**
 * GET /auth/me
 * Obtener perfil del usuario autenticado (requiere JWT)
 */
router.get("/me", verifyJWT, AuthController.getProfile);

/**
 * PUT /auth/profile
 * Actualizar perfil del usuario autenticado (requiere JWT)
 */
router.put("/profile", verifyJWT, AuthController.updateProfile);

export default router;

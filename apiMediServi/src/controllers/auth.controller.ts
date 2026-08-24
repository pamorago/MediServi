/**
 * Controlador de Autenticación - MediServi
 */

import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { LoginDTO, RegisterDTO } from "../dtos/auth.dto";

export class AuthController {
    /**
     * POST /auth/login
     * Login con email y contraseña
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body as LoginDTO;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email y contraseña son requeridos",
                });
                return;
            }

            const token = await AuthService.login({ email, password });

            res.status(200).json({
                success: true,
                message: "Login exitoso",
                data: token,
            });
        } catch (error: any) {
            res.status(401).json({
                success: false,
                message: error.message || "Error en login",
            });
        }
    }

    /**
     * POST /auth/register
     * Registro público de nuevos clientes
     */
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const { nombre, apellidos, email, password, telefono } =
                req.body as RegisterDTO;

            if (!nombre || !apellidos || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Nombre, apellidos, email y contraseña son requeridos",
                });
                return;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({
                    success: false,
                    message: "Email inválido",
                });
                return;
            }

            // Validar longitud de contraseña
            if (password.length < 6) {
                res.status(400).json({
                    success: false,
                    message: "La contraseña debe tener al menos 6 caracteres",
                });
                return;
            }

            const token = await AuthService.register({
                nombre,
                apellidos,
                email,
                password,
                telefono,
            });

            res.status(201).json({
                success: true,
                message: "Registro exitoso",
                data: token,
            });
        } catch (error: any) {
            if (error.message.includes("ya está registrado")) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error.message || "Error en registro",
                });
            }
        }
    }

    /**
     * GET /auth/me
     * Obtener perfil del usuario autenticado
     */
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId; // Viene del middleware de verificación

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "No autorizado",
                });
                return;
            }

            const usuario = await AuthService.getUserById(userId);

            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: "Usuario no encontrado",
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: usuario,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Error al obtener perfil",
            });
        }
    }

    /**
     * PUT /auth/profile
     * Actualizar perfil del usuario autenticado
     */
    static async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).userId; // Viene del middleware de verificación

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "No autorizado",
                });
                return;
            }

            const { nombre, apellidos, telefono, imagenPerfil } = req.body;

            const usuario = await AuthService.updateProfile(userId, {
                nombre,
                apellidos,
                telefono,
                imagenPerfil,
            });

            res.status(200).json({
                success: true,
                message: "Perfil actualizado",
                data: usuario,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || "Error al actualizar perfil",
            });
        }
    }
}

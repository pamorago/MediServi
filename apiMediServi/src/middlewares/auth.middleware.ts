/**
 * Middleware de Verificación JWT - MediServi
 */

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
    userId?: number;
    userEmail?: string;
    userRole?: string;
}

/**
 * Middleware para verificar token JWT
 * Extrae el token del header Authorization: Bearer <token>
 */
export const verifyJWT = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Token no proporcionado",
            });
            return;
        }

        const token = authHeader.substring(7); // Quitar "Bearer "

        const decoded = AuthService.verifyToken(token);

        if (!decoded) {
            res.status(401).json({
                success: false,
                message: "Token inválido o expirado",
            });
            return;
        }

        // Asignar datos del usuario al request
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.userRole = decoded.rol;

        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: "Error en autenticación: " + error.message,
        });
    }
};

/**
 * Middleware para verificar que el usuario sea ADMINISTRADOR
 */
export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.userRole !== "ADMINISTRADOR") {
        res.status(403).json({
            success: false,
            message: "Acceso denegado. Se requiere rol ADMINISTRADOR",
        });
        return;
    }

    next();
};

/**
 * Middleware para verificar que el usuario sea PROFESIONAL
 */
export const requireProfesional = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.userRole !== "PROFESIONAL") {
        res.status(403).json({
            success: false,
            message: "Acceso denegado. Se requiere rol PROFESIONAL",
        });
        return;
    }

    next();
};

/**
 * Middleware para verificar que el usuario sea CLIENTE
 */
export const requireCliente = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.userRole !== "CLIENTE") {
        res.status(403).json({
            success: false,
            message: "Acceso denegado. Se requiere rol CLIENTE",
        });
        return;
    }

    next();
};

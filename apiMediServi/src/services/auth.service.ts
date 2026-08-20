/**
 * Servicio de Autenticación - MediServi
 * Maneja JWT, hash de contraseñas y validaciones
 */

import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { prisma } from "../config/prisma";
import { LoginDTO, RegisterDTO, TokenDTO, DecodedToken } from "../dtos/auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || "mediservi-secret-key-change-in-production";
const JWT_EXPIRES_IN = "24h";

export class AuthService {
    /**
     * Hash de contraseña con bcryptjs
     */
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcryptjs.hash(password, saltRounds);
    }

    /**
     * Comparar contraseña con hash
     */
    static async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await bcryptjs.compare(password, hashedPassword);
    }

    /**
     * Generar JWT token
     */
    static generateToken(userId: number, email: string, rol: string): string {
        const payload = {
            id: userId,
            email,
            rol,
        };

        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            algorithm: "HS256",
        });
    }

    /**
     * Verificar y decodificar JWT token
     */
    static verifyToken(token: string): DecodedToken | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                algorithms: ["HS256"],
            }) as DecodedToken;
            return decoded;
        } catch (error) {
            console.error("Token verification failed:", error);
            return null;
        }
    }

    /**
     * Login: validar credenciales y retornar token
     */
    static async login(loginData: LoginDTO): Promise<TokenDTO> {
        // Buscar usuario por email
        const usuario = await prisma.usuario.findUnique({
            where: { email: loginData.email },
        });

        if (!usuario) {
            throw new Error("Credenciales inválidas");
        }

        if (usuario.estado !== "ACTIVO") {
            throw new Error("Usuario inactivo");
        }

        // Validar contraseña
        const passwordMatch = await this.comparePassword(
            loginData.password,
            usuario.password
        );

        if (!passwordMatch) {
            throw new Error("Credenciales inválidas");
        }

        // Generar token
        const token = this.generateToken(usuario.id, usuario.email, usuario.rol);

        return {
            access_token: token,
            token_type: "Bearer",
            expires_in: 86400, // 24 horas en segundos
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                email: usuario.email,
                rol: usuario.rol,
                estado: usuario.estado,
            },
        };
    }

    /**
     * Registro: crear nuevo usuario como CLIENTE
     */
    static async register(registerData: RegisterDTO): Promise<TokenDTO> {
        // Validar que el email no exista
        const existingUser = await prisma.usuario.findUnique({
            where: { email: registerData.email },
        });

        if (existingUser) {
            throw new Error("El email ya está registrado");
        }

        // Hash de contraseña
        const hashedPassword = await this.hashPassword(registerData.password);

        // Crear usuario con rol CLIENTE
        const newUser = await prisma.usuario.create({
            data: {
                nombre: registerData.nombre,
                apellidos: registerData.apellidos,
                email: registerData.email,
                password: hashedPassword,
                telefono: registerData.telefono || null,
                rol: "CLIENTE", // Solo clientes pueden auto-registrarse
                estado: "ACTIVO",
            },
        });

        // Generar token
        const token = this.generateToken(newUser.id, newUser.email, newUser.rol);

        return {
            access_token: token,
            token_type: "Bearer",
            expires_in: 86400, // 24 horas en segundos
            user: {
                id: newUser.id,
                nombre: newUser.nombre,
                apellidos: newUser.apellidos,
                email: newUser.email,
                rol: newUser.rol,
                estado: newUser.estado,
            },
        };
    }

    /**
     * Obtener perfil del usuario por su ID
     */
    static async getUserById(userId: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                telefono: true,
                rol: true,
                estado: true,
                perfil: true,
                createdAt: true,
            },
        });

        return usuario;
    }

    /**
     * Actualizar perfil del usuario autenticado
     */
    static async updateProfile(
        userId: number,
        updateData: {
            nombre?: string;
            apellidos?: string;
            telefono?: string;
        }
    ) {
        const usuario = await prisma.usuario.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                telefono: true,
                rol: true,
                estado: true,
            },
        });

        return usuario;
    }
}

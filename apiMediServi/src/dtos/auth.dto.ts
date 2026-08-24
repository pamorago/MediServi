/**
 * DTOs para autenticación - MediServi
 */

export interface LoginDTO {
    email: string;
    password: string;
}

export interface RegisterDTO {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    telefono?: string;
}

export interface TokenDTO {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
        id: number;
        nombre: string;
        apellidos: string;
        email: string;
        rol: "ADMINISTRADOR" | "PROFESIONAL" | "CLIENTE";
        estado: "ACTIVO" | "INACTIVO";
        imagenPerfil?: string | null;
    };
}

export interface DecodedToken {
    id: number;
    email: string;
    rol: string;
    iat: number;
    exp: number;
}

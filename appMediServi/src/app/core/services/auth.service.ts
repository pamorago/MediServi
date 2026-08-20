import {
    computed,
    inject,
    Injectable,
    signal,
} from '@angular/core'
import {
    HttpClient,
    HttpErrorResponse,
} from '@angular/common/http'
import { Router } from '@angular/router'
import {
    catchError,
    finalize,
    map,
    Observable,
    of,
    shareReplay,
    switchMap,
    tap,
    throwError,
} from 'rxjs'
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    CurrentUser,
} from '../models'

/**
 * Envoltorio de respuesta que usa el API para /auth/me y /auth/profile:
 * { success, message?, data: <recurso real> }
 */
interface ApiEnvelope<T> {
    success: boolean
    message?: string
    data: T
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient)
    private readonly router = inject(Router)
    private readonly apiUrl = 'http://localhost:3000/api/auth'
    private readonly tokenKey = 'access_token'

    private readonly _token = signal<string | null>(
        this.leerTokenAlmacenado()
    )
    private readonly _usuario = signal<CurrentUser | null>(null)
    private readonly _cargandoSesion = signal(false)
    private readonly _sesionInicializada = signal(false)
    private solicitudPerfilActual: Observable<CurrentUser | null> | null = null

    // Signals públicos en read-only
    readonly token = this._token.asReadonly()
    readonly usuario = this._usuario.asReadonly()
    readonly cargandoSesion = this._cargandoSesion.asReadonly()
    readonly sesionInicializada = this._sesionInicializada.asReadonly()

    /**
     * El usuario se considera autenticado cuando:
     * 1. existe un token
     * 2. el perfil fue recuperado correctamente
     */
    readonly autenticado = computed(
        () =>
            this._token() !== null &&
            this._usuario() !== null
    )

    readonly rol = computed(
        () => this._usuario()?.rol ?? null
    )

    readonly esAdmin = computed(() => {
        const rolActual = this.rol()
        return rolActual !== null && rolActual === 'ADMINISTRADOR'
    })

    readonly esProfesional = computed(() => {
        const rolActual = this.rol()
        return rolActual !== null && rolActual === 'PROFESIONAL'
    })

    readonly esCliente = computed(() => {
        const rolActual = this.rol()
        return rolActual !== null && rolActual === 'CLIENTE'
    })

    login(credenciales: LoginRequest): Observable<CurrentUser> {
        this._cargandoSesion.set(true)
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, credenciales)
            .pipe(
                map((response) => {
                    const resultado = response?.data
                    if (!resultado?.access_token) {
                        throw new Error(
                            'El API no devolvió el token de autenticación'
                        )
                    }
                    return resultado
                }),
                tap(({ access_token }) => {
                    this.guardarToken(access_token)
                }),
                switchMap(() => this.obtenerPerfil()),
                tap((usuario) => {
                    this._usuario.set(usuario)
                    this._sesionInicializada.set(true)
                }),
                catchError((error: unknown) => {
                    this.limpiarSesion()
                    return throwError(() => this.obtenerErrorAutenticacion(error))
                }),
                finalize(() => {
                    this._cargandoSesion.set(false)
                })
            )
    }

    registrar(datos: RegisterRequest): Observable<CurrentUser> {
        this._cargandoSesion.set(true)
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/register`, datos)
            .pipe(
                map((response) => {
                    const resultado = response?.data
                    if (!resultado?.access_token) {
                        throw new Error(
                            'El API no devolvió el token de autenticación'
                        )
                    }
                    return resultado
                }),
                tap(({ access_token }) => {
                    this.guardarToken(access_token)
                }),
                switchMap(() => this.obtenerPerfil()),
                tap((usuario) => {
                    this._usuario.set(usuario)
                    this._sesionInicializada.set(true)
                }),
                catchError((error: unknown) => {
                    this.limpiarSesion()
                    return throwError(() => this.obtenerErrorAutenticacion(error))
                }),
                finalize(() => {
                    this._cargandoSesion.set(false)
                })
            )
    }

    register(datos: RegisterRequest): Observable<CurrentUser> {
        return this.registrar(datos)
    }

    obtenerPerfil(): Observable<CurrentUser> {
        return this.http
            .get<ApiEnvelope<CurrentUser>>(`${this.apiUrl}/me`)
            .pipe(
                map((respuesta) => {
                    const usuario = respuesta?.data
                    if (!usuario) {
                        throw new Error(
                            'El API no devolvió la información del perfil'
                        )
                    }
                    return usuario
                })
            )
    }

    getProfile(): Observable<CurrentUser> {
        return this.obtenerPerfil()
    }

    /**
     * Restaura la sesión cuando inicia la aplicación.
     * Debe ejecutarse desde provideAppInitializer().
     */
    inicializarSesion(): Observable<CurrentUser | null> {
        if (this._sesionInicializada()) {
            return of(this._usuario())
        }
        const token = this._token()
        if (!token) {
            this._usuario.set(null)
            this._sesionInicializada.set(true)
            return of(null)
        }
        return this.cargarPerfil()
    }

    /**
     * Recupera el perfil usando el token almacenado.
     * shareReplay evita solicitudes duplicadas cuando
     * varios guards o componentes intentan restaurar
     * la sesión al mismo tiempo.
     */
    cargarPerfil(): Observable<CurrentUser | null> {
        if (this.solicitudPerfilActual) {
            return this.solicitudPerfilActual
        }
        const token = this._token()
        if (!token) {
            this._usuario.set(null)
            this._sesionInicializada.set(true)
            return of(null)
        }
        this._cargandoSesion.set(true)
        this.solicitudPerfilActual = this.obtenerPerfil().pipe(
            tap((usuario) => {
                this._usuario.set(usuario)
            }),
            map((usuario): CurrentUser | null => usuario),
            catchError(() => {
                this.limpiarSesion()
                return of(null)
            }),
            finalize(() => {
                this._cargandoSesion.set(false)
                this._sesionInicializada.set(true)
                this.solicitudPerfilActual = null
            }),
            shareReplay({
                bufferSize: 1,
                refCount: false,
            })
        )
        return this.solicitudPerfilActual
    }

    logout(redirigir = true): void {
        this.limpiarSesion()
        if (redirigir) {
            void this.router.navigate(['/login'])
        }
    }

    tieneRol(rolesPermitidos: string[]): boolean {
        const rolActual = this.rol()
        return (
            rolActual !== null &&
            rolesPermitidos.includes(rolActual)
        )
    }

    hasRole(role: string): boolean {
        return this.tieneRol([role])
    }

    obtenerToken(): string | null {
        return this._token()
    }

    getToken(): string | null {
        return this.obtenerToken()
    }

    // Compatibilidad con código anterior
    isLoggedIn(): boolean {
        return this.autenticado()
    }

    getCurrentUser(): CurrentUser | null {
        return this._usuario()
    }

    updateProfile(updateData: Partial<CurrentUser>): Observable<CurrentUser> {
        return this.http
            .put<ApiEnvelope<CurrentUser>>(`${this.apiUrl}/profile`, updateData)
            .pipe(
                map((respuesta) => {
                    const usuario = respuesta?.data
                    if (!usuario) {
                        throw new Error(
                            'El API no devolvió la información del perfil actualizado'
                        )
                    }
                    return usuario
                }),
                tap((usuario) => {
                    this._usuario.set(usuario)
                })
            )
    }

    private guardarToken(token: string): void {
        const tokenLimpio = token.trim()
        if (!tokenLimpio) {
            throw new Error('El token recibido no es válido')
        }
        localStorage.setItem(this.tokenKey, tokenLimpio)
        this._token.set(tokenLimpio)
    }

    private leerTokenAlmacenado(): string | null {
        const token = localStorage.getItem(this.tokenKey)
        if (!token) {
            return null
        }
        const tokenLimpio = token.trim()
        return tokenLimpio.length > 0 ? tokenLimpio : null
    }

    private limpiarSesion(): void {
        localStorage.removeItem(this.tokenKey)
        this._token.set(null)
        this._usuario.set(null)
        this._cargandoSesion.set(false)
        this._sesionInicializada.set(true)
        this.solicitudPerfilActual = null
    }

    /**
     * Convierte los errores de autenticación en mensajes
     * apropiados para la interfaz.
     */
    private obtenerErrorAutenticacion(error: unknown): Error {
        if (!(error instanceof HttpErrorResponse)) {
            return error instanceof Error
                ? error
                : new Error('No fue posible iniciar sesión')
        }
        if (error.status === 0) {
            return new Error(
                'No fue posible conectarse con el servidor'
            )
        }
        if (error.status === 400) {
            return new Error(
                error.error?.message ??
                'Los datos enviados no son válidos'
            )
        }
        if (error.status === 401) {
            return new Error(
                error.error?.message ??
                'Correo o contraseña incorrectos'
            )
        }
        if (error.status === 403) {
            return new Error(
                error.error?.message ??
                'No tiene permisos para realizar esta acción'
            )
        }
        if (error.status === 404) {
            return new Error(
                error.error?.message ??
                'No fue posible obtener el perfil del usuario'
            )
        }
        return new Error(
            error.error?.message ??
            'Ocurrió un error durante la autenticación'
        )
    }
}

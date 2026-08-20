import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // Obtener el token del servicio de autenticación
        const token = this.authService.getToken();

        // Si existe un token, agregarlo al header Authorization
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        // Pasar la solicitud al siguiente interceptor o handler
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Manejar errores de autenticación
                if (error.status === 401) {
                    console.warn('Token inválido o expirado. Cerrando sesión...');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }

                // Manejar otros errores
                if (error.status === 403) {
                    console.warn('Acceso denegado');
                    this.router.navigate(['/unauthorized']);
                }

                if (error.status === 500) {
                    console.error('Error en el servidor:', error.message);
                }

                return throwError(() => error);
            })
        );
    }
}

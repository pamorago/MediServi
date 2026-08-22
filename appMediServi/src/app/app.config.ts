import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => inject(AuthService).inicializarSesion()),
    // withInterceptorsFromDi() es obligatorio para que los interceptores
    // basados en clases (HTTP_INTERCEPTORS) se ejecuten. Sin esto, el
    // JwtInterceptor queda registrado pero nunca corre y el token JWT
    // nunca se adjunta a las peticiones.
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    provideRouter(routes),
    // Sin esto, la sesión NUNCA se restaura al refrescar el navegador:
    // AuthService.inicializarSesion() existía pero nadie la llamaba, así
    // que _usuario quedaba en null después de un refresh (aunque hubiera
    // un token válido guardado) y los guards mandaban al usuario a /login
    // como si no estuviera autenticado.
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return firstValueFrom(authService.inicializarSesion());
    }),
  ]
};

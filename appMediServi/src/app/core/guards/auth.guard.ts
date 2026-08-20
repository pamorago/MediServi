import { inject } from '@angular/core'
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { AuthService } from '../services/auth.service'

/**
 * Guard para proteger rutas que requieren autenticación.
 * Redirige a login si no está autenticado.
 */
export const AuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService)
    const router = inject(Router)

    if (authService.autenticado()) {
        return true
    }

    router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
    return false
}

/**
 * Guard para proteger rutas basadas en rol.
 * Verifica si el usuario tiene uno de los roles permitidos.
 */
export const RoleGuard = (allowedRoles: string[]): CanActivateFn => {
    return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const authService = inject(AuthService)
        const router = inject(Router)

        if (!authService.autenticado()) {
            router.navigate(['/login'], { queryParams: { returnUrl: state.url } })
            return false
        }

        if (authService.tieneRol(allowedRoles)) {
            return true
        }

        router.navigate(['/unauthorized'])
        return false
    }
}

import { Routes } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard.page';
import { CategoriasPageComponent } from './pages/categorias.page';
import { EspecialidadesPageComponent } from './pages/especialidades.page';
import { CitasPageComponent } from './pages/citas.page';
import { UsuariosPageComponent } from './pages/usuarios.page';
import { ProfesionalesPageComponent } from './pages/profesionales.page';
import { ProfesionalDetallePageComponent } from './pages/profesional-detalle.page';
import { ServiciosPageComponent } from './pages/servicios.page';
import { ServicioDetallePageComponent } from './pages/servicio-detalle.page';
import { CitaDetallePageComponent } from './pages/cita-detalle.page';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Reportes } from './pages/reportes/reportes';
import { Unauthorized } from './pages/unauthorized/unauthorized';
import { AgendaPage } from './pages/agenda/agenda-page';
import { AuthGuard, RoleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	// Rutas públicas (sin autenticación)
	{ path: 'login', component: Login },
	{ path: 'register', component: Register },
	{ path: 'unauthorized', component: Unauthorized },

	// Rutas protegidas (requieren autenticación)
	{ path: '', component: DashboardPageComponent, canActivate: [AuthGuard] },
	{ path: 'dashboard', component: DashboardPageComponent, canActivate: [AuthGuard] },

	// Agenda visual: disponible para cualquier rol autenticado.
	// El propio componente decide qué citas mostrar según el rol.
	{ path: 'agenda', component: AgendaPage, canActivate: [AuthGuard] },

	// Rutas de ADMINISTRADOR
	{
		path: 'usuarios',
		component: UsuariosPageComponent,
		canActivate: [RoleGuard(['ADMINISTRADOR'])],
	},
	{
		path: 'categorias',
		component: CategoriasPageComponent,
		canActivate: [RoleGuard(['ADMINISTRADOR'])],
	},
	{
		path: 'especialidades',
		component: EspecialidadesPageComponent,
		canActivate: [RoleGuard(['ADMINISTRADOR'])],
	},
	{
		path: 'reportes',
		component: Reportes,
		canActivate: [RoleGuard(['ADMINISTRADOR', 'PROFESIONAL'])],
	},

	// Rutas de CLIENTE y PROFESIONAL
	{ path: 'profesionales', component: ProfesionalesPageComponent, canActivate: [AuthGuard] },
	{ path: 'profesionales/:id', component: ProfesionalDetallePageComponent, canActivate: [AuthGuard] },

	// Rutas de CLIENTE (solicitar cita) y PROFESIONAL (gestionar cita)
	{ path: 'citas', component: CitasPageComponent, canActivate: [AuthGuard] },
	{ path: 'citas/:id', component: CitaDetallePageComponent, canActivate: [AuthGuard] },

	// Rutas de PROFESIONAL
	{
		path: 'servicios',
		component: ServiciosPageComponent,
		canActivate: [RoleGuard(['PROFESIONAL', 'ADMINISTRADOR'])],
	},
	{
		path: 'servicios/:id',
		component: ServicioDetallePageComponent,
		canActivate: [RoleGuard(['PROFESIONAL', 'ADMINISTRADOR'])],
	},

	// Ruta para recurso no encontrado
	{ path: '**', redirectTo: 'dashboard' },
];

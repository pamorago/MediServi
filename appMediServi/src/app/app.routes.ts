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

export const routes: Routes = [
	{ path: '', component: DashboardPageComponent },
	{ path: 'usuarios', component: UsuariosPageComponent },
	{ path: 'categorias', component: CategoriasPageComponent },
	{ path: 'especialidades', component: EspecialidadesPageComponent },
	{ path: 'profesionales', component: ProfesionalesPageComponent },
	{ path: 'profesionales/:id', component: ProfesionalDetallePageComponent },
	{ path: 'servicios', component: ServiciosPageComponent },
	{ path: 'servicios/:id', component: ServicioDetallePageComponent },
	{ path: 'citas', component: CitasPageComponent },
	{ path: 'citas/:id', component: CitaDetallePageComponent },
	{ path: '**', redirectTo: '' },
];

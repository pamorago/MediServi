import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Agenda } from '../../shared/components/agenda/agenda';
import { Cita, Profesional } from '../../core/models';

/**
 * Página de agenda visual. Decide, según el rol autenticado, qué citas
 * cargar y qué controles mostrar, y delega la representación visual al
 * componente reutilizable <app-agenda> (FullCalendar).
 *
 * - CLIENTE: ve únicamente sus propias citas (historial cronológico).
 * - PROFESIONAL: ve únicamente las citas asignadas a su perfil.
 * - ADMINISTRADOR: ve la agenda general, con filtros por profesional y fecha.
 */
@Component({
    selector: 'app-agenda-page',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, Agenda],
    templateUrl: './agenda-page.html',
    styleUrl: './agenda-page.scss',
})
export class AgendaPage implements OnInit {
    private readonly api = inject(ApiService);
    private readonly authService = inject(AuthService);

    citas: Cita[] = [];
    profesionales: Profesional[] = [];
    citaSeleccionada: Cita | null = null;

    loading = true;
    error = '';

    profesionalFiltro = '';
    fechaInicioFiltro = '';
    fechaFinFiltro = '';

    readonly filtroOpcionesEstado = [
        'TODAS',
        'PENDIENTE',
        'ACEPTADA',
        'RECHAZADA',
        'COMPLETADA',
        'CANCELADA',
    ];

    get esAdministrador(): boolean {
        return this.authService.esAdmin();
    }

    get tituloVista(): string {
        if (this.authService.esAdmin()) return 'Agenda general';
        if (this.authService.esProfesional()) return 'Mi agenda';
        return 'Mi historial de citas';
    }

    get descripcionVista(): string {
        if (this.authService.esAdmin()) {
            return 'Vista global de citas con filtros por profesional y rango de fechas.';
        }
        if (this.authService.esProfesional()) {
            return 'Citas asignadas a tu perfil profesional, con su estado actual.';
        }
        return 'Historial cronológico de tus citas, con su estado y acciones permitidas.';
    }

    ngOnInit(): void {
        if (this.esAdministrador) {
            this.api.getProfesionales().subscribe({
                next: (data) => (this.profesionales = data),
                error: () => {
                    // No bloquea la carga de la agenda si falla el listado de profesionales.
                },
            });
        }
        this.cargarCitas();
    }

    cargarCitas(): void {
        this.loading = true;
        this.error = '';

        const usuario = this.authService.usuario();
        const params: Record<string, string> = {};

        if (this.fechaInicioFiltro) params['fechaInicio'] = this.fechaInicioFiltro;
        if (this.fechaFinFiltro) params['fechaFin'] = this.fechaFinFiltro;
        if (this.esAdministrador && this.profesionalFiltro) {
            params['perfilProfesionalId'] = this.profesionalFiltro;
        }

        this.api.getCitasFiltradas(params).subscribe({
            next: (data) => {
                this.citas = this.filtrarPorRol(data, usuario?.id);
                this.loading = false;
            },
            error: () => {
                this.error = 'No se pudo cargar la agenda. Intenta de nuevo.';
                this.loading = false;
            },
        });
    }

    limpiarFiltros(): void {
        this.profesionalFiltro = '';
        this.fechaInicioFiltro = '';
        this.fechaFinFiltro = '';
        this.cargarCitas();
    }

    onSeleccionCita(cita: Cita): void {
        this.citaSeleccionada = cita;
    }

    estadoCitaClass(estado: Cita['estado']): string {
        switch (estado) {
            case 'ACEPTADA':
                return 'aceptada';
            case 'RECHAZADA':
                return 'rechazada';
            case 'CANCELADA':
                return 'cancelada';
            case 'COMPLETADA':
                return 'completada';
            default:
                return 'pendiente';
        }
    }

    /**
     * El API no expone un filtro directo por cliente ni por usuario del
     * profesional; para CLIENTE y PROFESIONAL restringimos el listado ya
     * recibido a lo que le corresponde ver a ese usuario autenticado.
     */
    private filtrarPorRol(citas: Cita[], usuarioId?: number): Cita[] {
        if (!usuarioId) return citas;

        if (this.authService.esCliente()) {
            return citas.filter((c) => c.clienteId === usuarioId || c.cliente?.id === usuarioId);
        }

        if (this.authService.esProfesional()) {
            return citas.filter((c) => c.profesional?.usuario?.id === usuarioId);
        }

        return citas;
    }
}

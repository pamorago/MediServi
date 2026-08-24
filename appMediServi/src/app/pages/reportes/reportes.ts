import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexStroke,
    ApexMarkers,
    ApexYAxis,
    ApexGrid,
    ApexTitleSubtitle,
    ApexLegend,
    ApexResponsive,
    ApexPlotOptions,
} from 'ng-apexcharts';
import {
    ReportesService,
    ReporteCitasPorEstado,
    ReporteCitasPorProfesional,
    ReporteCalificaciones,
} from '../../core/services/reportes.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/api.service';
import { Categoria, Profesional } from '../../core/models';

export type ChartOptions = {
    series: ApexAxisChartSeries | any[];
    chart: ApexChart;
    labels?: string[];
    xaxis?: ApexXAxis;
    dataLabels?: ApexDataLabels;
    stroke?: ApexStroke;
    markers?: ApexMarkers;
    yaxis?: ApexYAxis | ApexYAxis[];
    grid?: ApexGrid;
    title?: ApexTitleSubtitle;
    legend?: ApexLegend;
    responsive?: ApexResponsive[];
    plotOptions?: ApexPlotOptions;
};

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule, NgApexchartsModule],
    templateUrl: './reportes.html',
    styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
    isLoading = signal(false);
    errorMessage = signal('');
    citasPorEstado = signal<ReporteCitasPorEstado | null>(null);
    citasPorProfesional = signal<ReporteCitasPorProfesional[] | null>(null);
    calificaciones = signal<ReporteCalificaciones[] | null>(null);

    profesionales: Profesional[] = [];
    categorias: Categoria[] = [];

    fechaInicio = '';
    fechaFin = '';
    profesionalId: number | null = null;
    categoriaId: number | null = null;

    /** perfilProfesionalId propio, resuelto una vez cargada la lista de profesionales (solo rol PROFESIONAL). */
    private miPerfilProfesionalId: number | null = null;

    chartCitasEstado: ChartOptions = {
        series: [],
        labels: ['Pendiente', 'Aceptada', 'Rechazada', 'Cancelada', 'Completada'],
        chart: {
            type: 'donut',
            height: 350,
        },
        dataLabels: {
            enabled: true,
        },
        legend: {
            position: 'bottom',
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                },
            },
        },
    };

    Math = Math;

    constructor(
        private reportesService: ReportesService,
        private authService: AuthService,
        private api: ApiService
    ) { }

    ngOnInit(): void {
        const usuario = this.authService.usuario();

        this.api.getProfesionales().subscribe({
            next: (data) => {
                this.profesionales = data;
                if (usuario && this.authService.esProfesional()) {
                    this.miPerfilProfesionalId = data.find((p) => p.usuario.id === usuario.id)?.id ?? null;
                    // El profesional solo puede ver su propio reporte: el filtro
                    // queda bloqueado a su propio perfil.
                    this.profesionalId = this.miPerfilProfesionalId;
                }
                this.cargarReportes();
            },
            error: () => {
                this.cargarReportes();
            },
        });
        this.api.getCategorias().subscribe({
            next: (data) => (this.categorias = data),
            error: () => { },
        });
    }

    rangoFechaInvalido(): boolean {
        if (!this.fechaInicio || !this.fechaFin) return false;
        return this.fechaInicio > this.fechaFin;
    }

    periodoAplicado(): string {
        if (!this.fechaInicio && !this.fechaFin) return '';
        const desde = this.fechaInicio || '—';
        const hasta = this.fechaFin || '—';
        return `${desde} a ${hasta}`;
    }

    cargarReportes(): void {
        if (this.rangoFechaInvalido()) {
            this.errorMessage.set(
                'El rango de fechas no es válido: "Desde" no puede ser posterior a "Hasta".'
            );
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        const fechaInicio = this.fechaInicio || undefined;
        const fechaFin = this.fechaFin || undefined;
        const profesionalId = this.profesionalId ?? undefined;
        const categoriaId = this.categoriaId ?? undefined;

        this.reportesService
            .getCitasPorEstado(fechaInicio, fechaFin, profesionalId, categoriaId)
            .subscribe({
                next: (data) => {
                    this.citasPorEstado.set(data);
                    this.actualizarChartCitasEstado(data);
                },
                error: () => {
                    this.errorMessage.set('No se pudo cargar el reporte de citas por estado.');
                },
            });

        if (this.puedeVerReporteProfesional()) {
            this.reportesService.getCitasPorProfesional(fechaInicio, fechaFin, profesionalId).subscribe({
                next: (data) => {
                    this.citasPorProfesional.set(data);
                },
                error: () => {
                    this.errorMessage.set('No se pudo cargar el reporte de profesionales.');
                },
            });
        }

        if (this.puedeVerReporteCalificaciones()) {
            this.reportesService.getCalificaciones(undefined, profesionalId).subscribe({
                next: (data) => {
                    this.calificaciones.set(data);
                },
                error: () => {
                    this.errorMessage.set('No se pudo cargar el reporte de calificaciones.');
                },
                complete: () => {
                    this.isLoading.set(false);
                },
            });
        } else {
            this.isLoading.set(false);
        }
    }

    private actualizarChartCitasEstado(data: ReporteCitasPorEstado): void {
        this.chartCitasEstado = {
            ...this.chartCitasEstado,
            series: [
                data.estados.pendiente,
                data.estados.aceptada,
                data.estados.rechazada,
                data.estados.cancelada,
                data.estados.completada,
            ],
            labels: ['Pendiente', 'Aceptada', 'Rechazada', 'Cancelada', 'Completada'],
        };
    }

    limpiarFiltros(): void {
        this.fechaInicio = '';
        this.fechaFin = '';
        // Un profesional no puede limpiar el filtro de "Profesional": su
        // reporte siempre queda restringido a su propio perfil.
        this.profesionalId = this.esProfesional ? this.miPerfilProfesionalId : null;
        this.categoriaId = null;
        this.cargarReportes();
    }

    puedeVerReporteProfesional(): boolean {
        return this.authService.hasRole('ADMINISTRADOR');
    }

    puedeVerReporteCalificaciones(): boolean {
        return this.authService.hasRole('ADMINISTRADOR');
    }

    get esProfesional(): boolean {
        return this.authService.esProfesional();
    }

    /** El selector de "Profesional" solo tiene sentido para el administrador; el profesional ve siempre su propio reporte. */
    get puedeFiltrarPorProfesional(): boolean {
        return this.authService.hasRole('ADMINISTRADOR');
    }

    get tituloReporteEstado(): string {
        return this.esProfesional ? 'Mi reporte de citas' : 'Distribución de Citas por Estado';
    }
}

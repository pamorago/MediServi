import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Cita } from '../../../core/models';

/**
 * Componente de agenda visual reutilizable, basado en FullCalendar.
 * No conoce el rol del usuario ni cómo obtener las citas: recibe la
 * lista de citas ya filtrada por el componente contenedor (ver
 * pages/agenda/agenda-page) y solo se encarga de la representación
 * visual y de emitir la selección de una cita.
 */
@Component({
    selector: 'app-agenda',
    standalone: true,
    imports: [CommonModule, FormsModule, FullCalendarModule],
    templateUrl: './agenda.html',
    styleUrl: './agenda.scss',
})
export class Agenda implements OnInit, OnChanges {
    @Input() titulo = 'Agenda';
    @Input() citas: Cita[] = [];
    @Input() filtroOpciones: string[] = [];
    @Input() isLoading = false;
    @Output() seleccion = new EventEmitter<Cita>();

    citaSeleccionada = signal<Cita | null>(null);
    filtroSeleccionado = 'TODAS';
    calendarOptions: CalendarOptions = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        initialView: 'dayGridMonth',
        locale: 'es',
        height: 'auto',
        events: [],
        eventClick: (info) => this.onEventClick(info),
    };

    ngOnInit(): void {
        this.updateCalendarEvents();
    }

    ngOnChanges(): void {
        this.updateCalendarEvents();
    }

    private updateCalendarEvents(): void {
        const citasFiltradas =
            this.filtroSeleccionado === 'TODAS'
                ? this.citas
                : this.citas.filter((c) => c.estado === this.filtroSeleccionado);

        const events = citasFiltradas.map((cita) => ({
            id: cita.id.toString(),
            title: `${cita.cliente?.nombre || 'Cliente'} - ${cita.servicio?.nombre || 'Servicio'}`,
            start: `${cita.fechaCita}T${cita.horaInicio}`,
            end: `${cita.fechaCita}T${cita.horaFin}`,
            backgroundColor: this.getColorPorEstado(cita.estado),
            borderColor: this.getColorPorEstado(cita.estado),
            extendedProps: cita,
        }));

        this.calendarOptions = { ...this.calendarOptions, events };
    }

    private getColorPorEstado(estado: string): string {
        const colores: { [key: string]: string } = {
            PENDIENTE: '#ffc107',
            ACEPTADA: '#28a745',
            RECHAZADA: '#dc3545',
            COMPLETADA: '#17a2b8',
            CANCELADA: '#6c757d',
        };
        return colores[estado] || '#667eea';
    }

    onEventClick(info: any): void {
        const cita = info.event.extendedProps as Cita;
        this.citaSeleccionada.set(cita);
    }

    onFiltroChange(): void {
        this.updateCalendarEvents();
    }

    onSeleccionar(cita: Cita): void {
        this.seleccion.emit(cita);
    }
}

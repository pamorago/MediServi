import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Cita } from '../core/models';

@Component({
  selector: 'app-cita-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <section class="card" *ngIf="cita">
      <h2>Detalle de la cita</h2>
      <p><strong>Cliente:</strong> {{ cita.cliente?.nombre }} {{ cita.cliente?.apellidos }}</p>
      <p><strong>Profesional:</strong> {{ cita.profesional?.usuario?.nombre }} {{ cita.profesional?.usuario?.apellidos }}</p>
      <p><strong>Servicio:</strong> {{ cita.servicio?.nombre }}</p>
      <p><strong>Fecha:</strong> {{ cita.fechaCita | date: 'MM/dd/yyyy' }}</p>
      <p>
        <strong>Hora:</strong>
        {{ cita.horaInicio | date: 'hh:mm a' }} -
        {{ cita.horaFin | date: 'hh:mm a' }}
      </p>
      <p><strong>Modalidad:</strong> {{ cita.modalidad }}</p>
      <p><strong>Estado:</strong> {{ cita.estado }}</p>
      <p><strong>Comentario:</strong> {{ cita.comentarioCliente || 'Sin comentario' }}</p>
      <a routerLink="/citas">Volver</a>
    </section>

    <p *ngIf="loading" class="status">Cargando detalle...</p>
    <p *ngIf="error" class="status error">{{ error }}</p>
  `,
})
export class CitaDetallePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  cita: Cita | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getCitaById(id).subscribe({
      next: (data) => {
        this.cita = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle de la cita.';
        this.loading = false;
      },
    });
  }
}

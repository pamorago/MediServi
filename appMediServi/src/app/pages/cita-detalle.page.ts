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
    <div *ngIf="loading" class="status-box loading">Cargando detalle de la cita...</div>
    <div *ngIf="error" class="status-box error">{{ error }}</div>

    <ng-container *ngIf="cita && !loading">

      <section class="card detail-header">
        <div class="cit-hero">
          <div class="module-head">
            <span class="module-id">CIT-{{ cita.id }}</span>
            <h2>Detalle de cita</h2>
          </div>
          <div class="badges">
            <span class="pill" [ngClass]="estadoClass(cita.estado)">{{ cita.estado }}</span>
            <span class="pill modalidad">{{ cita.modalidad }}</span>
          </div>
        </div>
      </section>

      <div class="detail-grid">

        <section class="card">
          <h3 class="section-title">Cliente</h3>
          <dl class="info-list">
            <dt>Nombre</dt>
            <dd>{{ cita.cliente?.nombre }} {{ cita.cliente?.apellidos }}</dd>
            <dt>Correo</dt>
            <dd>{{ cita.cliente?.email ?? 'No registrado' }}</dd>
            <dt>Teléfono</dt>
            <dd>{{ cita.cliente?.telefono ?? 'No registrado' }}</dd>
          </dl>
        </section>

        <section class="card">
          <h3 class="section-title">Profesional</h3>
          <dl class="info-list">
            <dt>Nombre</dt>
            <dd>{{ cita.profesional?.usuario?.nombre }} {{ cita.profesional?.usuario?.apellidos }}</dd>
            <dt>Título</dt>
            <dd>{{ cita.profesional?.tituloProfesional }}</dd>
            <dt>Modalidad</dt>
            <dd>{{ cita.profesional?.modalidad }}</dd>
          </dl>
        </section>

        <section class="card">
          <h3 class="section-title">Servicio</h3>
          <dl class="info-list">
            <dt>Nombre</dt>
            <dd>{{ cita.servicio?.nombre }}</dd>
            <dt>Duración</dt>
            <dd>{{ cita.servicio?.duracionMinutos }} minutos</dd>
            <dt>Precio</dt>
            <dd>₡{{ cita.servicio?.precio | number }}</dd>
          </dl>
        </section>

        <section class="card">
          <h3 class="section-title">Fecha y hora</h3>
          <dl class="info-list">
            <dt>Fecha</dt>
            <dd>{{ cita.fechaCita | date: 'dd/MM/yyyy' }}</dd>
            <dt>Hora inicio</dt>
            <dd>{{ cita.horaInicio | date: 'HH:mm' }}</dd>
            <dt>Hora fin</dt>
            <dd>{{ cita.horaFin | date: 'HH:mm' }}</dd>
            <dt>Modalidad</dt>
            <dd>{{ cita.modalidad }}</dd>
          </dl>
        </section>

        <section class="card">
          <h3 class="section-title">Estado</h3>
          <dl class="info-list">
            <dt>Estado actual</dt>
            <dd><span class="pill" [ngClass]="estadoClass(cita.estado)">{{ cita.estado }}</span></dd>
            <dt>Monto estimado</dt>
            <dd>₡{{ cita.montoEstimado | number }}</dd>
          </dl>
        </section>

        <section class="card full-col" *ngIf="cita.comentarioCliente">
          <h3 class="section-title">Descripción / Comentario</h3>
          <p class="descripcion">{{ cita.comentarioCliente }}</p>
        </section>

      </div>

      <div style="margin-top:1rem">
        <a class="btn-back" routerLink="/citas">← Volver al listado</a>
      </div>
    </ng-container>
  `,
  styles: [`
    .status-box {
      border-radius:10px; padding:.7rem 1rem; margin:.5rem 0; font-size:.88rem;
    }
    .status-box.loading { background:#f0f7ff; color:#1a5276; border:1px solid #aed6f1; }
    .status-box.error { background:#fdf2f2; color:#c0392b; border:1px solid #f5b7b1; }

    .detail-header { margin-bottom:1rem; }
    .cit-hero { display:flex; flex-direction:column; gap:.5rem; }
    .badges { display:flex; gap:.4rem; flex-wrap:wrap; }

    .detail-grid {
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:1rem;
    }
    .full-col { grid-column: 1 / -1; }

    .section-title {
      font-size:.92rem; font-weight:700; color:var(--color-text);
      margin:0 0 .75rem; padding-bottom:.4rem;
      border-bottom:1px dashed var(--color-outline);
    }

    .info-list { display:grid; grid-template-columns:auto 1fr; gap:.3rem .9rem; margin:0; }
    dt { font-weight:600; font-size:.82rem; color:var(--color-subtle); }
    dd { margin:0; font-size:.9rem; }

    .descripcion { font-size:.9rem; line-height:1.6; color:var(--color-text); margin:0; }

    .pill {
      display:inline-block; border-radius:999px; padding:.2rem .55rem;
      font-size:.72rem; font-weight:700; color:#7a5b13; background:#f9efd2;
    }
    .pill.modalidad { color:#234f45; background:#edf7f3; }
    .pill.aceptada { color:#1f5a49; background:#dff3ec; }
    .pill.rechazada, .pill.cancelada { color:#7a1c1c; background:#fbe6e6; }
    .pill.completada { color:#2a445f; background:#e3ecf8; }

    .btn-back {
      display:inline-block; padding:.45rem .9rem; border-radius:8px;
      background:var(--color-soft); border:1px solid var(--color-outline);
      color:var(--color-text); text-decoration:none; font-size:.87rem;
    }
    .btn-back:hover { background:var(--color-outline); }

    @media (max-width: 640px) {
      .detail-grid { grid-template-columns: 1fr; }
      .full-col { grid-column: 1; }
    }
  `],
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

  estadoClass(estado: Cita['estado']): string {
    switch (estado) {
      case 'ACEPTADA': return 'aceptada';
      case 'RECHAZADA': return 'rechazada';
      case 'CANCELADA': return 'cancelada';
      case 'COMPLETADA': return 'completada';
      default: return '';
    }
  }
}

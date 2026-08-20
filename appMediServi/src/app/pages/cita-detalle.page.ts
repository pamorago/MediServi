import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/services/auth.service';
import { Cita, ResenaPayload } from '../core/models';

@Component({
  selector: 'app-cita-detalle-page',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, RouterLink],
  template: `
    @if (loading) {
    <div class="status-box loading">Cargando detalle de la cita...</div>
    }
    @if (error) {
    <div class="status-box error">{{ error }}</div>
    }

    @if (cita && !loading) {

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

        @if (cita.comentarioCliente) {
        <section class="card full-col">
          <h3 class="section-title">Descripción / Comentario</h3>
          <p class="descripcion">{{ cita.comentarioCliente }}</p>
        </section>
        }

        <section class="card full-col review-section">
          <h3 class="section-title">Reseña y calificación</h3>

          @if (cita.resena; as resena) {
          <div class="review-readonly">
            <div class="review-rating" aria-label="Puntuación">
              <span class="stars">{{ estrellas(resena.puntuacion) }}</span>
              <strong>{{ resena.puntuacion }}/5</strong>
            </div>
            @if (resena.comentario) {
            <p class="descripcion">{{ resena.comentario }}</p>
            }
            <small>Publicada el {{ resena.createdAt | date: 'dd/MM/yyyy' }}</small>
          </div>
          } @else if (puedeCalificar()) {
          <form (ngSubmit)="crearResena(formResena)" #formResena="ngForm" class="review-form" novalidate>
            <div class="field">
              <label for="puntuacion">Puntuación *</label>
              <select id="puntuacion" [(ngModel)]="resenaForm.puntuacion" name="puntuacion" required>
                <option [ngValue]="0">Seleccione una puntuación</option>
                @for (puntuacion of puntuaciones; track puntuacion) {
                <option [ngValue]="puntuacion">{{ estrellas(puntuacion) }} {{ puntuacion }}/5</option>
                }
              </select>
            </div>
            <div class="field">
              <label for="comentario">Comentario (opcional)</label>
              <textarea id="comentario" [(ngModel)]="resenaForm.comentario" name="comentario"
                        maxlength="500" rows="4" placeholder="Contá cómo fue tu experiencia..."></textarea>
              <span class="field-hint">{{ (resenaForm.comentario ?? '').length }}/500</span>
            </div>
            @if (reviewError) {
            <div class="status-box error">{{ reviewError }}</div>
            }
            @if (reviewSuccess) {
            <div class="status-box success">{{ reviewSuccess }}</div>
            }
            <button type="submit" class="primary" [disabled]="guardandoResena">
              {{ guardandoResena ? 'Enviando...' : 'Publicar calificación' }}
            </button>
          </form>
          } @else {
          <p class="review-hint">La reseña solo está disponible para el cliente dueño de una cita completada.</p>
          }
        </section>

      </div>

      <div style="margin-top:1rem">
        <a class="btn-back" routerLink="/citas">← Volver al listado</a>
      </div>
    }
  `,
  styles: [`
    .status-box {
      border-radius:10px; padding:.7rem 1rem; margin:.5rem 0; font-size:.88rem;
    }
    .status-box.loading { background:#f0f7ff; color:#1a5276; border:1px solid #aed6f1; }
    .status-box.error { background:#fdf2f2; color:#c0392b; border:1px solid #f5b7b1; }
    .status-box.success { background:#f0faf5; color:#1e8449; border:1px solid #a9dfbf; }

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
    .review-form { display:grid; gap:.8rem; max-width:520px; }
    .field { display:flex; flex-direction:column; gap:.3rem; }
    .field label { font-size:.82rem; font-weight:600; }
    .field select, .field textarea { font:inherit; border:1px solid var(--color-outline); border-radius:8px; padding:.55rem .65rem; }
    .field-hint, .review-readonly small { color:var(--color-subtle); font-size:.78rem; }
    .review-rating { display:flex; align-items:center; gap:.55rem; margin-bottom:.6rem; }
    .stars { color:#d99b1d; letter-spacing:.08em; font-size:1.15rem; }
    .review-readonly { display:grid; gap:.25rem; }
    .review-hint { color:var(--color-subtle); font-size:.88rem; margin:0; }

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
  private readonly authService = inject(AuthService);

  cita: Cita | null = null;
  loading = true;
  error = '';
  guardandoResena = false;
  reviewError = '';
  reviewSuccess = '';
  readonly puntuaciones = [1, 2, 3, 4, 5];
  resenaForm: ResenaPayload = { citaId: 0, clienteId: 0, puntuacion: 0, comentario: '' };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarCita(id);
  }

  cargarCita(id: number): void {
    this.loading = true;
    this.api.getCitaById(id).subscribe({
      next: (data) => {
        this.cita = data;
        const usuario = this.authService.usuario();
        this.resenaForm = { citaId: data.id, clienteId: usuario?.id ?? 0, puntuacion: 0, comentario: '' };
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle de la cita.';
        this.loading = false;
      },
    });
  }

  puedeCalificar(): boolean {
    const usuario = this.authService.usuario();
    return !!this.cita && this.authService.esCliente() && usuario?.id === this.cita.clienteId
      && this.cita.estado === 'COMPLETADA' && !this.cita.resena;
  }

  estrellas(puntuacion: number): string {
    return '★'.repeat(puntuacion) + '☆'.repeat(5 - puntuacion);
  }

  crearResena(formRef: NgForm): void {
    formRef.form.markAllAsTouched();
    this.reviewError = '';
    this.reviewSuccess = '';
    if (formRef.invalid || !this.resenaForm.puntuacion) {
      this.reviewError = 'Seleccioná una puntuación entre 1 y 5.';
      return;
    }

    this.guardandoResena = true;
    this.api.createResena({
      ...this.resenaForm,
      citaId: this.cita?.id ?? 0,
      clienteId: this.authService.usuario()?.id ?? 0,
      puntuacion: Number(this.resenaForm.puntuacion),
      comentario: this.resenaForm.comentario?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.reviewSuccess = 'La calificación se publicó correctamente.';
        this.guardandoResena = false;
        this.cargarCita(this.cita?.id ?? 0);
      },
      error: (err) => {
        this.reviewError = err?.error?.error ?? 'No se pudo publicar la calificación.';
        this.guardandoResena = false;
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

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Servicio } from '../core/models';

@Component({
  selector: 'app-servicio-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <section class="card" *ngIf="servicio">
      <h2>Detalle del servicio</h2>
      <p><strong>Nombre:</strong> {{ servicio.nombre }}</p>
      <p><strong>Categoria:</strong> {{ servicio.categoria?.nombre }}</p>
      <p><strong>Profesional:</strong> {{ servicio.perfil?.usuario?.nombre }} {{ servicio.perfil?.usuario?.apellidos }}</p>
      <p><strong>Modalidad:</strong> {{ servicio.modalidad }}</p>
      <p><strong>Precio:</strong> {{ servicio.precio }}</p>
      <p><strong>Duracion:</strong> {{ servicio.duracionMinutos }} min</p>
      <p><strong>Estado:</strong> {{ servicio.estado }}</p>
      <p><strong>Descripcion:</strong> {{ servicio.descripcion }}</p>

      <div class="section" *ngIf="servicio.especialidades?.length">
        <h3>Especialidades asociadas</h3>
        <div class="tags">
          <span *ngFor="let item of servicio.especialidades" class="tag">{{ item.especialidad.nombre }}</span>
        </div>
      </div>

      <div class="section">
        <h3>Comentarios y evaluaciones</h3>
        <p *ngIf="totalResenas > 0">
          <strong>Calificacion promedio:</strong>
          {{ promedioResenas | number: '1.1-1' }} / 5 ({{ totalResenas }} evaluaciones)
        </p>
        <p *ngIf="totalResenas === 0" class="muted">Este servicio aun no tiene evaluaciones registradas.</p>

        <article class="resena" *ngFor="let item of evaluacionesServicio">
          <div class="resena-head">
            <strong>{{ item.cliente }}</strong>
            <span>{{ item.fecha | date: 'MM/dd/yyyy' }}</span>
          </div>
          <p class="stars">{{ estrellas(item.puntuacion) }} ({{ item.puntuacion }}/5)</p>
          <p>{{ item.comentario }}</p>
        </article>
      </div>

      <a routerLink="/servicios">Volver</a>
    </section>

    <p *ngIf="loading" class="status">Cargando detalle...</p>
    <p *ngIf="error" class="status error">{{ error }}</p>
  `,
  styles: [
    `
      .section {
        margin-top: 1rem;
        padding-top: 0.7rem;
        border-top: 1px dashed #c2d8cf;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .tag {
        border-radius: 999px;
        padding: 0.2rem 0.6rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: #28594d;
        background: #e4f3ed;
      }

      .resena {
        margin-top: 0.75rem;
        border: 1px solid #d9e9e3;
        border-radius: 10px;
        padding: 0.65rem 0.75rem;
        background: #fbfefd;
      }

      .resena-head {
        display: flex;
        justify-content: space-between;
        gap: 0.8rem;
      }

      .resena-head span {
        color: var(--color-subtle);
        font-size: 0.85rem;
      }

      .stars {
        margin: 0.35rem 0;
        color: #7a5b13;
        font-weight: 700;
      }

      .muted {
        color: var(--color-subtle);
      }
    `,
  ],
})
export class ServicioDetallePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  servicio: Servicio | null = null;
  evaluacionesServicio: Array<{
    cliente: string;
    puntuacion: number;
    comentario: string;
    fecha: string;
  }> = [];
  promedioResenas = 0;
  totalResenas = 0;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getServicioById(id).subscribe({
      next: (data) => {
        this.servicio = data;
        this.cargarEvaluaciones(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del servicio.';
        this.loading = false;
      },
    });
  }

  estrellas(puntuacion: number): string {
    const llenas = '★'.repeat(Math.max(0, Math.min(5, puntuacion)));
    const vacias = '☆'.repeat(Math.max(0, 5 - puntuacion));
    return `${llenas}${vacias}`;
  }

  private cargarEvaluaciones(servicio: Servicio): void {
    const evaluaciones = (servicio.citas || [])
      .filter((cita) => !!cita.resena)
      .map((cita) => ({
        cliente: `${cita.cliente?.nombre || ''} ${cita.cliente?.apellidos || ''}`.trim() || 'Cliente sin nombre',
        puntuacion: cita.resena?.puntuacion || 0,
        comentario: cita.resena?.comentario || 'Sin comentario.',
        fecha: cita.resena?.createdAt || cita.fechaCita,
      }));

    this.evaluacionesServicio = evaluaciones;
    this.totalResenas = evaluaciones.length;

    const suma = evaluaciones.reduce((acc, item) => acc + item.puntuacion, 0);
    this.promedioResenas = this.totalResenas ? suma / this.totalResenas : 0;
  }
}

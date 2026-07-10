import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Servicio } from '../core/models';

@Component({
  selector: 'app-servicio-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="loading" class="status-box loading">Cargando detalle del servicio...</div>
    <div *ngIf="error" class="status-box error">{{ error }}</div>

    <ng-container *ngIf="servicio && !loading">

      <section class="card detail-header">
        <div class="svc-hero">
          <div class="svc-hero-info">
            <div class="module-head">
              <span class="module-id">SVC-{{ servicio.id }}</span>
              <h2>{{ servicio.nombre }}</h2>
            </div>
            <div class="badges">
              <span class="pill modalidad">{{ servicio.modalidad }}</span>
              <span class="pill" [class.off]="servicio.estado === 'INACTIVO'">
                {{ servicio.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="detail-grid">

        <section class="card">
          <h3 class="section-title">Información del servicio</h3>
          <dl class="info-list">
            <dt>Precio</dt>
            <dd>₡{{ servicio.precio | number }}</dd>
            <dt>Duración</dt>
            <dd>{{ servicio.duracionMinutos }} minutos</dd>
            <dt>Modalidad</dt>
            <dd>{{ servicio.modalidad }}</dd>
            <dt>Estado</dt>
            <dd>{{ servicio.estado }}</dd>
          </dl>
        </section>

        <section class="card">
          <h3 class="section-title">Profesional</h3>
          <dl class="info-list" *ngIf="servicio.perfil">
            <dt>Nombre</dt>
            <dd>{{ servicio.perfil.usuario.nombre }} {{ servicio.perfil.usuario.apellidos }}</dd>
            <dt>Título</dt>
            <dd>{{ servicio.perfil.tituloProfesional }}</dd>
            <dt>Modalidad</dt>
            <dd>{{ servicio.perfil.modalidad }}</dd>
            <dt>Disponibilidad</dt>
            <dd>{{ servicio.perfil.disponible ? 'Disponible' : 'No disponible' }}</dd>
          </dl>
          <p class="muted" *ngIf="!servicio.perfil">Profesional no encontrado.</p>
        </section>

        <section class="card">
          <h3 class="section-title">Categoría</h3>
          <dl class="info-list" *ngIf="servicio.categoria">
            <dt>Nombre</dt>
            <dd>{{ servicio.categoria.nombre }}</dd>
            <dt>Estado</dt>
            <dd>{{ servicio.categoria.estado }}</dd>
          </dl>
          <p class="muted" *ngIf="!servicio.categoria">Categoría no encontrada.</p>
        </section>

        <section class="card">
          <h3 class="section-title">Especialidades asociadas</h3>
          <div *ngIf="servicio.especialidades && servicio.especialidades.length > 0" class="tags">
            <span class="tag" *ngFor="let e of servicio.especialidades">
              {{ e.especialidad.nombre }}
            </span>
          </div>
          <p class="muted" *ngIf="!servicio.especialidades || servicio.especialidades.length === 0">
            Este servicio no tiene especialidades registradas.
          </p>
        </section>

        <section class="card full-col">
          <h3 class="section-title">Descripción</h3>
          <p class="descripcion">{{ servicio.descripcion }}</p>
        </section>

      </div>

      <div style="margin-top:1rem">
        <a class="btn-back" routerLink="/servicios">← Volver al listado</a>
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
    .svc-hero { display:flex; gap:1.2rem; align-items:flex-start; flex-wrap:wrap; }
    .svc-hero-info { flex:1; min-width:220px; }
    .badges { display:flex; gap:.4rem; flex-wrap:wrap; margin-top:.5rem; }

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

    .tags { display:flex; flex-wrap:wrap; gap:.45rem; }
    .tag {
      border-radius:999px; padding:.25rem .65rem; font-size:.78rem;
      font-weight:700; color:#28594d; background:#e4f3ed;
    }

    .pill {
      display:inline-block; border-radius:999px; padding:.2rem .55rem;
      font-size:.72rem; font-weight:700; color:#2d5b4f; background:#e3f3ee;
    }
    .pill.off { color:#7a1c1c; background:#fbe6e6; }
    .pill.modalidad { color:#234f45; background:#edf7f3; }

    .muted { color:var(--color-subtle); font-size:.85rem; margin:0; }
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
export class ServicioDetallePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  servicio: Servicio | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getServicioById(id).subscribe({
      next: (data) => {
        this.servicio = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del servicio.';
        this.loading = false;
      },
    });
  }
}

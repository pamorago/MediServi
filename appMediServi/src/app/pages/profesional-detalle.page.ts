import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Profesional } from '../core/models';

@Component({
  selector: 'app-profesional-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="loading" class="status-box loading">Cargando detalle del profesional...</div>
    <div *ngIf="error" class="status-box error">{{ error }}</div>

    <ng-container *ngIf="profesional && !loading">
      <section class="card detail-header">
        <div class="prof-hero">
          <img [src]="api.getImageUrl(profesional.imagenPerfil)"
               alt="Foto de {{ profesional.usuario.nombre }}"
               class="prof-avatar"
               (error)="onImgError($event)" />
          <div class="prof-hero-info">
            <div class="module-head">
              <span class="module-id">PRO-{{ profesional.id }}</span>
              <h2>{{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}</h2>
            </div>
            <p class="subtitle">{{ profesional.tituloProfesional }}</p>
            <div class="badges">
              <span class="pill modalidad">{{ profesional.modalidad }}</span>
              <span class="pill" [class.off]="!profesional.disponible">
                {{ profesional.disponible ? 'Disponible' : 'No disponible' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="detail-grid">

        <section class="card">
          <h3 class="section-title">Información de contacto</h3>
          <dl class="info-list">
            <dt>Correo</dt>
            <dd>{{ profesional.usuario.email }}</dd>
            <dt>Teléfono</dt>
            <dd>{{ profesional.usuario.telefono ?? 'No registrado' }}</dd>
            <dt>Ubicación</dt>
            <dd>{{ profesional.provincia }}, {{ profesional.canton }}, {{ profesional.distrito }}</dd>
          </dl>
        </section>

        <section class="card">
          <h3 class="section-title">Información profesional</h3>
          <dl class="info-list">
            <dt>Años de experiencia</dt>
            <dd>{{ profesional.aniosExperiencia }} año{{ profesional.aniosExperiencia !== 1 ? 's' : '' }}</dd>
            <dt>Tarifa base</dt>
            <dd>₡{{ profesional.tarifaBase | number }}</dd>
            <dt>Modalidad</dt>
            <dd>{{ profesional.modalidad }}</dd>
          </dl>
        </section>

        <section class="card full-col">
          <h3 class="section-title">Descripción</h3>
          <p class="descripcion">{{ profesional.descripcion }}</p>
        </section>

        <section class="card full-col">
          <h3 class="section-title">Especialidades</h3>
          <div *ngIf="profesional.especialidades && profesional.especialidades.length > 0" class="tags">
            <span class="tag" *ngFor="let e of profesional.especialidades">
              {{ e.especialidad.nombre }}
            </span>
          </div>
          <p class="muted" *ngIf="!profesional.especialidades || profesional.especialidades.length === 0">
            Este profesional no tiene especialidades registradas.
          </p>
        </section>

        <section class="card full-col" *ngIf="profesional.servicios && profesional.servicios.length > 0">
          <h3 class="section-title">Servicios ofrecidos</h3>
          <ul class="svc-list">
            <li *ngFor="let s of profesional.servicios" class="svc-item">
              <div>
                <strong>{{ s.nombre }}</strong>
                <span class="pill" [class.off]="s.estado === 'INACTIVO'" style="margin-left:.5rem">{{ s.estado }}</span>
              </div>
              <div class="svc-meta">
                <span>₡{{ s.precio | number }}</span>
                <span>{{ s.duracionMinutos }} min</span>
                <span class="pill modalidad">{{ s.modalidad }}</span>
              </div>
            </li>
          </ul>
        </section>

      </div>

      <div style="margin-top:1rem">
        <a class="btn-back" routerLink="/profesionales">← Volver al listado</a>
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
    .prof-hero { display:flex; gap:1.2rem; align-items:flex-start; flex-wrap:wrap; }
    .prof-avatar {
      width:96px; height:96px; border-radius:14px; object-fit:cover;
      border:2px solid var(--color-outline); flex-shrink:0;
    }
    .prof-hero-info { flex:1; min-width:220px; }
    .subtitle { color:var(--color-subtle); margin:.2rem 0 .6rem; font-size:.95rem; }
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

    .svc-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.6rem; }
    .svc-item {
      display:flex; justify-content:space-between; align-items:center;
      flex-wrap:wrap; gap:.5rem;
      padding:.55rem .75rem; border:1px solid var(--color-outline);
      border-radius:10px; background:var(--color-soft);
    }
    .svc-meta { display:flex; gap:.6rem; align-items:center; font-size:.82rem; color:var(--color-subtle); }

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
export class ProfesionalDetallePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly api = inject(ApiService);

  profesional: Profesional | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProfesionalById(id).subscribe({
      next: (data: Profesional) => {
        this.profesional = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del profesional.';
        this.loading = false;
      },
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = this.api.getImageUrl('perfil-not-found.png');
  }
}


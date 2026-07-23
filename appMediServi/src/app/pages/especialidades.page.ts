import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Especialidad } from '../core/models';

@Component({
  selector: 'app-especialidades-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="card module-banner esp-banner">
      <div class="module-head">
        <span class="module-id">MOD-ESP</span>
        <h2>Especialidades medicas</h2>
      </div>
      <p>Equipo interdisciplinario para atencion preventiva, diagnostico y seguimiento integral.</p>

      <div class="toolbar">
        <input [(ngModel)]="search" placeholder="Buscar especialidad" (keyup.enter)="cargarEspecialidades()" />
        <select [(ngModel)]="estadoFiltro" (change)="cargarEspecialidades()">
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <button class="primary" (click)="cargarEspecialidades()">Aplicar filtros</button>
      </div>
    </section>

    @if (loading) {
    <p class="status">Cargando especialidades...</p>
    }
    @if (error) {
    <p class="status error">{{ error }}</p>
    }

    @if (!loading && !error) {
    <section class="grid cards">
      @for (item of especialidades; track item.id) {
      <article class="card">
        <span class="record-id">ESP-{{ item.id }} </span>
        <div class="pill" [class.off]="item.estado === 'INACTIVO'">{{ item.estado }}</div>
        <h3>{{ item.nombre }}</h3>
        <p>{{ item.descripcion || 'Sin descripcion registrada' }}</p>
        <div class="actions" style="margin-top: 0.7rem">
          <button (click)="toggleEstado(item)">{{ item.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}</button>
        </div>
      </article>
      }
    </section>
    }
  `,
  styles: [
    `
      .cards {
        margin-top: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .module-banner {
        border-left: 5px solid #4a8a83;
        background: linear-gradient(165deg, #f7fcfb, #eef7f5);
      }

      .esp-banner .module-id {
        color: #2f6a64;
      }

      .pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: #2f5d58;
        background: #e4f3ef;
      }

      .pill.off {
        color: #7a1c1c;
        background: #fbe6e6;
      }

      h3 {
        margin: 0;
      }

      p {
        margin: 0.5rem 0 0;
        color: var(--color-subtle);
      }

      @media (max-width: 900px) {
        .cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class EspecialidadesPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  especialidades: Especialidad[] = [];
  loading = true;
  error = '';
  search = '';
  estadoFiltro = '';

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.loading = true;
    const params: Record<string, string> = {};
    if (this.search.trim()) params['search'] = this.search.trim();
    if (this.estadoFiltro) params['estado'] = this.estadoFiltro;

    this.api.getEspecialidadesFiltradas(params).subscribe({
      next: (data) => {
        this.especialidades = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las especialidades.';
        this.loading = false;
      },
    });
  }

  toggleEstado(item: Especialidad): void {
    const estado = item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!confirm(`Confirma cambiar el estado a ${estado}?`)) return;

    this.api.setEstadoEspecialidad(item.id, estado).subscribe({
      next: () => this.cargarEspecialidades(),
      error: () => {
        this.error = 'No se pudo actualizar la especialidad.';
      },
    });
  }
}

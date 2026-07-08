import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Categoria } from '../core/models';

@Component({
  selector: 'app-categorias-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card intro module-banner cat-banner">
      <div class="module-head">
        <span class="module-id">MOD-CAT</span>
        <h2>Categorias de servicio</h2>
      </div>
      <p>
        En MediServi cada categoria agrupa prestaciones clinicas concretas para facilitar la referencia,
        la programacion de consulta y la continuidad del tratamiento.
      </p>
      <ul>
        <li>Consulta preventiva, diagnostico inicial y control de evolucion.</li>
        <li>Atencion presencial o virtual segun perfil clinico del paciente.</li>
        <li>Registro estructurado para seguimiento por profesional tratante.</li>
      </ul>

      <div class="toolbar">
        <input [(ngModel)]="search" (keydown.enter)="cargarCategorias()" placeholder="Buscar por nombre" />
        <select [(ngModel)]="estadoFiltro">
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <button class="primary" (click)="cargarCategorias()">Aplicar filtros</button>
        <button type="button" (click)="limpiarFiltros()">Limpiar</button>
      </div>
    </section>

    <p *ngIf="loading" class="status">Cargando categorias...</p>
    <p *ngIf="error" class="status error">{{ error }}</p>

    <section class="grid cards" *ngIf="!loading && !error">
      <article class="card" *ngFor="let categoria of categorias">
        <span class="record-id">CAT-{{ categoria.id }}</span>
        <div class="pill" [class.off]="categoria.estado === 'INACTIVO'">{{ categoria.estado }}</div>
        <h3>{{ categoria.nombre }}</h3>
        <p class="base">{{ categoria.descripcion || 'Servicio clinico disponible para consulta, control y orientacion terapeutica.' }}</p>
        <p class="detalle">{{ obtenerDetalleClinico(categoria.nombre) }}</p>
        <div class="actions" style="margin-top: 0.7rem">
          <button (click)="toggleEstado(categoria)">{{ categoria.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}</button>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .intro p {
        margin-bottom: 0.65rem;
      }

      .module-banner {
        border-left: 5px solid #4f8f7f;
        background: linear-gradient(165deg, #f7fcf9, #eef7f3);
      }

      .cat-banner .module-id {
        color: #2f6e5f;
      }

      .intro ul {
        margin: 0;
        padding-left: 1.15rem;
        color: var(--color-subtle);
      }

      .intro li {
        margin-bottom: 0.35rem;
      }

      .cards {
        margin-top: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: #2f5f52;
        background: #e4f3ed;
      }

      .pill.off {
        color: #7a1c1c;
        background: #fbe6e6;
      }

      h3 {
        margin: 0.8rem 0 0.35rem;
      }

      .base {
        margin: 0;
        color: var(--color-subtle);
      }

      .detalle {
        margin: 0.7rem 0 0;
        border-top: 1px dashed #c2d8cf;
        padding-top: 0.6rem;
        font-size: 0.93rem;
      }

      @media (max-width: 900px) {
        .cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CategoriasPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  categorias: Categoria[] = [];
  loading = true;
  error = '';
  search = '';
  estadoFiltro = '';

  private readonly detallePorCategoria: Record<string, string> = {
    'medicina general':
      'Incluye control de enfermedades cronicas, evaluacion de sintomas agudos, referencia a especialidad y plan terapeutico inicial.',
    pediatria:
      'Incluye control de crecimiento y desarrollo, orientacion de lactancia, evaluacion de fiebre y esquema de vacunacion infantil.',
    psicologia:
      'Incluye tamizaje emocional, psicoterapia breve, intervencion en ansiedad y acompanamiento en procesos de duelo o estres.',
    'nutricion y dietetica':
      'Incluye diagnostico nutricional, plan alimentario por objetivos clinicos y monitoreo de adherencia con ajustes periodicos.',
    dermatologia:
      'Incluye valoracion de lesiones cutaneas, manejo de dermatitis y acne, y recomendaciones de cuidado dermocosmetico.',
    fisioterapia:
      'Incluye rehabilitacion musculo-esqueletica, ejercicios terapeuticos y control de dolor para recuperar movilidad funcional.',
  };

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.loading = true;
    const params: Record<string, string> = {};
    if (this.search.trim()) params['search'] = this.search.trim();
    if (this.estadoFiltro) params['estado'] = this.estadoFiltro;

    this.api.getCategoriasFiltradas(params).subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las categorias.';
        this.loading = false;
      },
    });
  }

  toggleEstado(categoria: Categoria): void {
    const estado = categoria.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!confirm(`Confirma cambiar el estado a ${estado}?`)) return;

    this.api.setEstadoCategoria(categoria.id, estado).subscribe({
      next: () => this.cargarCategorias(),
      error: () => {
        this.error = 'No fue posible actualizar la categoria.';
      },
    });
  }

  limpiarFiltros(): void {
    this.search = '';
    this.estadoFiltro = '';
    this.cargarCategorias();
  }

  obtenerDetalleClinico(nombreCategoria: string): string {
    const clave = this.normalizarTexto(nombreCategoria);
    return (
      this.detallePorCategoria[clave] ||
      'Prestacion clinica orientada a mejorar calidad de vida con evaluacion, educacion al paciente y seguimiento.'
    );
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}

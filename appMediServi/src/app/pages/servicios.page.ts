import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Categoria, Especialidad, Profesional, Servicio, ServicioPayload } from '../core/models';

@Component({
  selector: 'app-servicios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="card">
      <div class="module-head">
        <span class="module-id">MOD-SER</span>
        <h2>Servicios</h2>
      </div>
      <p>Administracion de servicios con filtros por categoria, modalidad y rango de precio.</p>

      <div class="summary">
        <span>Total: {{ servicios.length }}</span>
        <span>Activos: {{ contarPorEstado('ACTIVO') }}</span>
        <span>Inactivos: {{ contarPorEstado('INACTIVO') }}</span>
      </div>

      <div class="toolbar">
        <input [(ngModel)]="search" (keydown.enter)="aplicarFiltrosLocales()" placeholder="Buscar por nombre" />
        <select [(ngModel)]="servicioSeleccionadoId">
          <option [ngValue]="null">Todos los servicios</option>
          <option *ngFor="let item of todosServicios" [ngValue]="item.id">
            {{ item.nombre }}
          </option>
        </select>
        <select [(ngModel)]="categoriaFiltro">
          <option value="">Todas las categorias</option>
          <option *ngFor="let c of categorias" [value]="c.id">{{ c.nombre }}</option>
        </select>
        <select [(ngModel)]="modalidadFiltro">
          <option value="">Todas las modalidades</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <select [(ngModel)]="estadoFiltro">
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <input [(ngModel)]="precioMin" type="number" placeholder="Precio min" />
        <input [(ngModel)]="precioMax" type="number" placeholder="Precio max" />
        <button class="primary" (click)="aplicarFiltrosLocales()">Aplicar filtros</button>
        <button type="button" (click)="limpiarFiltros()">Limpiar</button>
      </div>

      <div class="table-wrap" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Profesional</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Modalidad</th>
              <th>Estado</th>
              <th>Evaluacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let servicio of servicios">
              <td><span class="record-id">SER-{{ servicio.id }}</span></td>
              <td>{{ servicio.nombre }}</td>
              <td>{{ servicio.perfil?.usuario?.nombre }} {{ servicio.perfil?.usuario?.apellidos }}</td>
              <td>{{ servicio.categoria?.nombre }}</td>
              <td>{{ servicio.precio }}</td>
              <td><span class="pill modalidad">{{ servicio.modalidad }}</span></td>
              <td><span class="pill" [class.off]="servicio.estado === 'INACTIVO'">{{ servicio.estado }}</span></td>
              <td>
                <ng-container *ngIf="servicio.totalEvaluaciones; else sinEvaluaciones">
                  <strong>{{ servicio.promedioEvaluacion?.toFixed(1) }}/5</strong>
                  <div class="muted">{{ servicio.totalEvaluaciones }} comentarios</div>
                </ng-container>
                <ng-template #sinEvaluaciones>
                  <span class="muted">Sin evaluaciones</span>
                </ng-template>
              </td>
              <td class="actions">
                <button (click)="editar(servicio)">Editar</button>
                <button (click)="toggleEstado(servicio)">{{ servicio.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}</button>
                <a class="detail-link" [routerLink]="['/servicios', servicio.id]">Detalle</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="loading" class="status">Cargando servicios...</p>
      <p *ngIf="error" class="status error">{{ error }}</p>
    </section>

    <section class="card" style="margin-top: 1rem">
      <div class="module-head">
        <span class="module-id">FORM-SER</span>
        <h3>{{ editandoId ? 'Editar servicio' : 'Crear servicio' }}</h3>
      </div>
      <form (ngSubmit)="guardar()" class="form-grid">
        <select [(ngModel)]="form.perfilProfesionalId" name="perfilProfesionalId" required>
          <option [ngValue]="0">Seleccione profesional</option>
          <option *ngFor="let p of profesionales" [ngValue]="p.id">{{ p.usuario.nombre }} {{ p.usuario.apellidos }}</option>
        </select>
        <select [(ngModel)]="form.categoriaId" name="categoriaId" required>
          <option [ngValue]="0">Seleccione categoria</option>
          <option *ngFor="let c of categorias" [ngValue]="c.id">{{ c.nombre }}</option>
        </select>
        <input [(ngModel)]="form.nombre" name="nombre" placeholder="Nombre" required />
        <input [(ngModel)]="form.precio" type="number" name="precio" placeholder="Precio" required min="1" />
        <input [(ngModel)]="form.duracionMinutos" type="number" name="duracionMinutos" placeholder="Duracion" required min="1" />
        <select [(ngModel)]="form.modalidad" name="modalidad" required>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <select [(ngModel)]="form.estado" name="estado" required>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <select [(ngModel)]="especialidadSeleccionada" name="especialidadSeleccionada">
          <option [ngValue]="null">Agregar especialidad</option>
          <option *ngFor="let item of especialidades" [ngValue]="item.id">{{ item.nombre }}</option>
        </select>
        <button type="button" (click)="agregarEspecialidad()">Agregar especialidad</button>
        <textarea class="full" [(ngModel)]="form.descripcion" name="descripcion" placeholder="Descripcion" rows="3" required></textarea>

        <div class="full">
          <strong>Especialidades asociadas:</strong>
          <span *ngFor="let id of form.especialidadIds" style="margin-right: 0.4rem">#{{ id }}</span>
        </div>

        <div class="full actions">
          <button class="primary" type="submit">{{ editandoId ? 'Guardar cambios' : 'Crear servicio' }}</button>
          <button type="button" (click)="limpiarFormulario()">Limpiar</button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .summary {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 0.65rem;
      }

      .summary span {
        border: 1px solid var(--color-outline);
        border-radius: 999px;
        background: var(--color-soft);
        font-size: 0.82rem;
        padding: 0.2rem 0.55rem;
      }

      .pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: #2d5b4f;
        background: #e3f3ee;
      }

      .pill.off {
        color: #7a1c1c;
        background: #fbe6e6;
      }

      .pill.modalidad {
        color: #234f45;
        background: #edf7f3;
      }

      .detail-link {
        color: #25695a;
        font-weight: 700;
        text-decoration: none;
      }

      .detail-link:hover {
        color: #1d5649;
        text-decoration: underline;
      }

      .muted {
        color: var(--color-subtle);
        font-size: 0.82rem;
      }
    `,
  ],
})
export class ServiciosPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  todosServicios: Servicio[] = [];
  servicios: Servicio[] = [];
  categorias: Categoria[] = [];
  profesionales: Profesional[] = [];
  especialidades: Especialidad[] = [];
  loading = false;
  error = '';

  search = '';
  servicioSeleccionadoId: number | null = null;
  categoriaFiltro = '';
  modalidadFiltro = '';
  estadoFiltro = '';
  precioMin = '';
  precioMax = '';

  editandoId: number | null = null;
  especialidadSeleccionada: number | null = null;

  form: ServicioPayload = {
    perfilProfesionalId: 0,
    categoriaId: 0,
    nombre: '',
    descripcion: '',
    precio: 1,
    duracionMinutos: 1,
    modalidad: 'MIXTA',
    estado: 'ACTIVO',
    especialidadIds: [],
  };

  ngOnInit(): void {
    this.api.getCategorias().subscribe((data) => (this.categorias = data));
    this.api.getEspecialidades().subscribe((data) => (this.especialidades = data));
    this.api.getProfesionales().subscribe((data) => (this.profesionales = data));
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.loading = true;
    this.error = '';

    this.api.getServicios().subscribe({
      next: (data) => {
        this.todosServicios = data;
        this.aplicarFiltrosLocales();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los servicios.';
        this.loading = false;
      },
    });
  }

  aplicarFiltrosLocales(): void {
    const search = this.search.trim().toLowerCase();
    const precioMin = this.precioMin ? Number(this.precioMin) : null;
    const precioMax = this.precioMax ? Number(this.precioMax) : null;

    this.servicios = this.todosServicios.filter((servicio) => {
      const precio = Number(servicio.precio);

      const matchSearch = !search || servicio.nombre.toLowerCase().includes(search);
      const matchServicio = !this.servicioSeleccionadoId || servicio.id === this.servicioSeleccionadoId;
      const matchCategoria = !this.categoriaFiltro || Number(servicio.categoriaId) === Number(this.categoriaFiltro);
      const matchModalidad = !this.modalidadFiltro || servicio.modalidad === this.modalidadFiltro;
      const matchEstado = !this.estadoFiltro || servicio.estado === this.estadoFiltro;
      const matchPrecioMin = precioMin === null || precio >= precioMin;
      const matchPrecioMax = precioMax === null || precio <= precioMax;

      return matchSearch && matchServicio && matchCategoria && matchModalidad && matchEstado && matchPrecioMin && matchPrecioMax;
    });
  }

  limpiarFiltros(): void {
    this.search = '';
    this.servicioSeleccionadoId = null;
    this.categoriaFiltro = '';
    this.modalidadFiltro = '';
    this.estadoFiltro = '';
    this.precioMin = '';
    this.precioMax = '';
    this.aplicarFiltrosLocales();
  }

  contarPorEstado(estado: 'ACTIVO' | 'INACTIVO'): number {
    return this.servicios.filter((s) => s.estado === estado).length;
  }

  agregarEspecialidad(): void {
    if (!this.especialidadSeleccionada) return;
    if (!this.form.especialidadIds) this.form.especialidadIds = [];
    if (!this.form.especialidadIds.includes(this.especialidadSeleccionada)) {
      this.form.especialidadIds.push(this.especialidadSeleccionada);
    }
  }

  editar(servicio: Servicio): void {
    this.editandoId = servicio.id;
    this.api.getServicioById(servicio.id).subscribe((detalle) => {
      const especialidadIds = (detalle as unknown as { especialidades?: Array<{ especialidadId: number }> }).especialidades?.map((x) => x.especialidadId) || [];
      this.form = {
        perfilProfesionalId: detalle.perfilProfesionalId,
        categoriaId: detalle.categoriaId,
        nombre: detalle.nombre,
        descripcion: detalle.descripcion,
        precio: Number(detalle.precio),
        duracionMinutos: detalle.duracionMinutos,
        modalidad: detalle.modalidad,
        estado: detalle.estado,
        especialidadIds,
      };
    });
  }

  guardar(): void {
    if (!this.form.perfilProfesionalId || !this.form.categoriaId) {
      this.error = 'Profesional y categoria son obligatorios.';
      return;
    }

    if (this.form.precio <= 0 || this.form.duracionMinutos <= 0) {
      this.error = 'Precio y duracion deben ser mayores a cero.';
      return;
    }

    const payload: ServicioPayload = {
      ...this.form,
      perfilProfesionalId: Number(this.form.perfilProfesionalId),
      categoriaId: Number(this.form.categoriaId),
      precio: Number(this.form.precio),
      duracionMinutos: Number(this.form.duracionMinutos),
      especialidadIds: (this.form.especialidadIds || []).map((id) => Number(id)).filter((id) => id > 0),
    };

    const request = this.editandoId
      ? this.api.updateServicio(this.editandoId, payload)
      : this.api.createServicio(payload);

    request.subscribe({
      next: () => {
        this.limpiarFormulario();
        this.cargarServicios();
      },
      error: () => {
        this.error = 'No fue posible guardar el servicio.';
      },
    });
  }

  toggleEstado(servicio: Servicio): void {
    const siguiente = servicio.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!confirm(`Confirma cambiar el estado a ${siguiente}?`)) return;

    this.api.setEstadoServicio(servicio.id, siguiente).subscribe({
      next: () => this.cargarServicios(),
      error: () => {
        this.error = 'No se pudo cambiar el estado del servicio.';
      },
    });
  }

  limpiarFormulario(): void {
    this.editandoId = null;
    this.form = {
      perfilProfesionalId: 0,
      categoriaId: 0,
      nombre: '',
      descripcion: '',
      precio: 1,
      duracionMinutos: 1,
      modalidad: 'MIXTA',
      estado: 'ACTIVO',
      especialidadIds: [],
    };
  }
}

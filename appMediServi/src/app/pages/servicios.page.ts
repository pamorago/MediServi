import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
          @for (item of todosServicios; track item.id) {
          <option [ngValue]="item.id">
            {{ item.nombre }}
          </option>
          }
        </select>
        <select [(ngModel)]="categoriaFiltro">
          <option value="">Todas las categorias</option>
          @for (c of categorias; track c.id) {
          <option [value]="c.id">{{ c.nombre }}</option>
          }
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

      @if (!loading && !error) {
      <div class="table-wrap">
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
            @for (servicio of servicios; track servicio.id) {
            <tr>
              <td><span class="record-id">SER-{{ servicio.id }}</span></td>
              <td>{{ servicio.nombre }}</td>
              <td>{{ servicio.perfil?.usuario?.nombre }} {{ servicio.perfil?.usuario?.apellidos }}</td>
              <td>{{ servicio.categoria?.nombre }}</td>
              <td>{{ servicio.precio }}</td>
              <td><span class="pill modalidad">{{ servicio.modalidad }}</span></td>
              <td><span class="pill" [class.off]="servicio.estado === 'INACTIVO'">{{ servicio.estado }}</span></td>
              <td>
                @if (servicio.totalEvaluaciones) {
                <strong>{{ servicio.promedioEvaluacion?.toFixed(1) }}/5</strong>
                <div class="muted">{{ servicio.totalEvaluaciones }} comentarios</div>
                } @else {
                <span class="muted">Sin evaluaciones</span>
                }
              </td>
              <td class="actions">
                <button (click)="editar(servicio)">Editar</button>
                <button (click)="toggleEstado(servicio)">{{ servicio.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}</button>
                <a class="detail-link" [routerLink]="['/servicios', servicio.id]">Detalle</a>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }

      @if (loading) {
      <p class="status">Cargando servicios...</p>
      }
      @if (error) {
      <p class="status error">{{ error }}</p>
      }
    </section>

    <section class="card" style="margin-top: 1rem">
      <div class="module-head">
        <span class="module-id">FORM-SER</span>
        <h3>{{ editandoId ? 'Editar servicio' : 'Crear servicio' }}</h3>
      </div>
      <form (ngSubmit)="guardar(formSer)" #formSer="ngForm" class="form-grid" novalidate>

        <div class="field">
          <label>Profesional *</label>
          <select [(ngModel)]="form.perfilProfesionalId" name="perfilProfesionalId" required #profSer="ngModel">
            <option [ngValue]="0">— Seleccione profesional —</option>
            @for (p of profesionales; track p.id) {
            <option [ngValue]="p.id">{{ p.usuario.nombre }} {{ p.usuario.apellidos }}</option>
            }
          </select>
          @if (profSer.invalid && profSer.touched) {
          <span class="field-error">El profesional es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label>Categoría *</label>
          <select [(ngModel)]="form.categoriaId" name="categoriaId" required #catSer="ngModel">
            <option [ngValue]="0">— Seleccione categoría —</option>
            @for (c of categorias; track c.id) {
            <option [ngValue]="c.id">{{ c.nombre }}</option>
            }
          </select>
          @if (catSer.invalid && catSer.touched) {
          <span class="field-error">La categoría es obligatoria.</span>
          }
        </div>

        <div class="field">
          <label>Nombre del servicio *</label>
          <input [(ngModel)]="form.nombre" name="nombre" required #nombreSer="ngModel"
                 placeholder="Ej: Consulta médica general" />
          @if (nombreSer.invalid && nombreSer.touched) {
          <span class="field-error">El nombre es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label>Precio (₡) *</label>
          <input [(ngModel)]="form.precio" type="number" name="precio" required min="1" #precioSer="ngModel" placeholder="0" />
          @if (precioSer.invalid && precioSer.touched) {
          <span class="field-error">El precio debe ser mayor a cero.</span>
          }
        </div>

        <div class="field">
          <label>Duración (minutos) *</label>
          <input [(ngModel)]="form.duracionMinutos" type="number" name="duracionMinutos" required min="1" #durSer="ngModel" placeholder="0" />
          @if (durSer.invalid && durSer.touched) {
          <span class="field-error">La duración debe ser mayor a cero.</span>
          }
        </div>

        <div class="field">
          <label>Modalidad *</label>
          <select [(ngModel)]="form.modalidad" name="modalidad" required>
            <option value="VIRTUAL">Virtual</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="MIXTA">Mixta</option>
          </select>
        </div>

        <div class="field">
          <label>Estado</label>
          <select [(ngModel)]="form.estado" name="estado">
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>

        <div class="field full">
          <label>Descripción *</label>
          <textarea [(ngModel)]="form.descripcion" name="descripcion" required #descSer="ngModel"
                    rows="3" placeholder="Descripción del servicio..."></textarea>
          @if (descSer.invalid && descSer.touched) {
          <span class="field-error">La descripción es obligatoria.</span>
          }
        </div>

        <div class="field full">
          <label>Especialidades asociadas</label>
          <div class="inline-add">
            <select [(ngModel)]="especialidadSeleccionada" name="especialidadSeleccionada">
              <option [ngValue]="null">— Seleccionar especialidad —</option>
              @for (item of especialidades; track item.id) {
              <option [ngValue]="item.id">{{ item.nombre }}</option>
              }
            </select>
            <button type="button" class="btn-outline" (click)="agregarEspecialidad()">Agregar</button>
          </div>
          @if (especialidadesSeleccionadas.length > 0) {
          <div class="tags-list" style="margin-top:.5rem">
            @for (e of especialidadesSeleccionadas; track e.id) {
            <span class="tag">
              {{ e.nombre }}
              <button type="button" class="tag-remove" (click)="quitarEspecialidad(e.id)">✕</button>
            </span>
            }
          </div>
          } @else {
          <p class="muted">Sin especialidades seleccionadas.</p>
          }
        </div>

        <div class="full actions">
          <button class="primary" type="submit" [disabled]="guardando">
            {{ guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear servicio') }}
          </button>
          <button type="button" class="btn-outline" (click)="limpiarFormulario(formSer)">Cancelar</button>
        </div>

        @if (formError) {
        <div class="status-box error" style="margin-top:.75rem">{{ formError }}</div>
        }
        @if (formExito) {
        <div class="status-box success" style="margin-top:.75rem">{{ formExito }}</div>
        }
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

      .tags-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }
      .tag {
        display: inline-flex; align-items: center; gap: 0.3rem;
        border-radius: 999px; padding: 0.2rem 0.6rem; font-size: 0.78rem;
        font-weight: 700; color: #28594d; background: #e4f3ed;
      }
      .tag-remove {
        background: none; border: none; cursor: pointer; font-size: 0.7rem;
        color: #28594d; padding: 0; line-height: 1;
      }
      .tag-remove:hover { color: #c0392b; }
      .btn-outline { background: transparent; border: 1px solid var(--color-outline); color: var(--color-text); }
      .btn-outline:hover { background: var(--color-soft); }
      .field { display:flex; flex-direction:column; gap:.3rem; }
      .field label { font-size:.82rem; font-weight:600; color:var(--color-text); }
      .field-error { font-size:.78rem; color:#c0392b; margin-top:.1rem; }
      .inline-add { display:flex; gap:.5rem; align-items:center; }
      .inline-add select { flex:1; }
      .status-box {
        border-radius: 10px; padding: 0.6rem 0.9rem; font-size: 0.88rem;
      }
      .status-box.error { background: #fdf2f2; color: #c0392b; border: 1px solid #f5b7b1; }
      .status-box.success { background: #f0faf5; color: #1e8449; border: 1px solid #a9dfbf; }
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
  formError = '';
  formExito = '';
  guardando = false;

  search = '';
  servicioSeleccionadoId: number | null = null;
  categoriaFiltro = '';
  modalidadFiltro = '';
  estadoFiltro = '';
  precioMin = '';
  precioMax = '';

  editandoId: number | null = null;
  especialidadSeleccionada: number | null = null;
  especialidadesSeleccionadas: { id: number; nombre: string }[] = [];

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
    const yaExiste = this.especialidadesSeleccionadas.some((e) => e.id === this.especialidadSeleccionada);
    if (yaExiste) return;
    const esp = this.especialidades.find((e) => e.id === this.especialidadSeleccionada);
    if (esp) {
      this.especialidadesSeleccionadas.push({ id: esp.id, nombre: esp.nombre });
      this.form.especialidadIds = this.especialidadesSeleccionadas.map((e) => e.id);
    }
    this.especialidadSeleccionada = null;
  }

  quitarEspecialidad(id: number): void {
    this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter((e) => e.id !== id);
    this.form.especialidadIds = this.especialidadesSeleccionadas.map((e) => e.id);
  }

  editar(servicio: Servicio): void {
    this.editandoId = servicio.id;
    this.api.getServicioById(servicio.id).subscribe((detalle) => {
      const especialidadIds =
        (detalle as unknown as { especialidades?: Array<{ especialidadId: number; especialidad: { nombre: string } }> })
          .especialidades?.map((x) => x.especialidadId) || [];
      this.especialidadesSeleccionadas =
        (detalle as unknown as { especialidades?: Array<{ especialidadId: number; especialidad: { nombre: string } }> })
          .especialidades?.map((x) => ({ id: x.especialidadId, nombre: x.especialidad.nombre })) || [];
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

  guardar(formRef?: NgForm): void {
    if (formRef) formRef.form.markAllAsTouched();
    this.formError = '';
    this.formExito = '';
    if (formRef?.invalid) {
      this.formError = 'Completá todos los campos requeridos antes de guardar.';
      return;
    }

    if (!this.form.perfilProfesionalId || !this.form.categoriaId) {
      this.formError = 'Profesional y categoría son obligatorios.';
      return;
    }

    if (this.form.precio <= 0 || this.form.duracionMinutos <= 0) {
      this.formError = 'Precio y duración deben ser mayores a cero.';
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

    this.guardando = true;
    const request = this.editandoId
      ? this.api.updateServicio(this.editandoId, payload)
      : this.api.createServicio(payload);

    request.subscribe({
      next: () => {
        this.formExito = this.editandoId
          ? 'Servicio actualizado correctamente.'
          : 'Servicio creado correctamente.';
        this.limpiarFormulario();
        this.cargarServicios();
        this.guardando = false;
      },
      error: () => {
        this.formError = 'No fue posible guardar el servicio. Verifique los datos.';
        this.guardando = false;
      },
    });
  }

  toggleEstado(servicio: Servicio): void {
    const siguiente = servicio.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!confirm('Confirma cambiar el estado de "' + servicio.nombre + '" a ' + siguiente + '?')) return;

    this.api.setEstadoServicio(servicio.id, siguiente).subscribe({
      next: () => {
        this.formExito = 'Estado del servicio actualizado a ' + siguiente + '.';
        this.cargarServicios();
      },
      error: () => {
        this.error = 'No se pudo cambiar el estado del servicio.';
      },
    });
  }

  limpiarFormulario(formRef?: NgForm): void {
    this.editandoId = null;
    this.especialidadesSeleccionadas = [];
    this.especialidadSeleccionada = null;
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
    this.formError = '';
    setTimeout(() => formRef?.resetForm());
  }
}

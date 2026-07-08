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

      <div class="toolbar">
        <input [(ngModel)]="search" placeholder="Buscar por nombre" />
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
        <button class="primary" (click)="cargarServicios()">Aplicar</button>
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
              <td>{{ servicio.modalidad }}</td>
              <td>{{ servicio.estado }}</td>
              <td class="actions">
                <button (click)="editar(servicio)">Editar</button>
                <button (click)="toggleEstado(servicio)">{{ servicio.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}</button>
                <a [routerLink]="['/servicios', servicio.id]">Detalle</a>
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
})
export class ServiciosPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  servicios: Servicio[] = [];
  categorias: Categoria[] = [];
  profesionales: Profesional[] = [];
  especialidades: Especialidad[] = [];
  loading = false;
  error = '';

  search = '';
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

    const params: Record<string, string> = {};
    if (this.search.trim()) params['search'] = this.search.trim();
    if (this.categoriaFiltro) params['categoriaId'] = this.categoriaFiltro;
    if (this.modalidadFiltro) params['modalidad'] = this.modalidadFiltro;
    if (this.estadoFiltro) params['estado'] = this.estadoFiltro;
    if (this.precioMin) params['precioMin'] = this.precioMin;
    if (this.precioMax) params['precioMax'] = this.precioMax;

    this.api.getServicios(params).subscribe({
      next: (data) => {
        this.servicios = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los servicios.';
        this.loading = false;
      },
    });
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

    const request = this.editandoId
      ? this.api.updateServicio(this.editandoId, this.form)
      : this.api.createServicio(this.form);

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

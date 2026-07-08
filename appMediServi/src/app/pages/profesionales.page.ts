import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Especialidad, Profesional, ProfesionalPayload } from '../core/models';

@Component({
  selector: 'app-profesionales-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="card">
      <div class="module-head">
        <span class="module-id">MOD-PRO</span>
        <h2>Profesionales</h2>
      </div>
      <p>Gestion de profesionales con filtros, formulario de registro/edicion y cambio de disponibilidad.</p>

      <div class="toolbar">
        <input [(ngModel)]="search" placeholder="Buscar por nombre" />
        <select [(ngModel)]="modalidadFiltro">
          <option value="">Todas las modalidades</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <select [(ngModel)]="disponibleFiltro">
          <option value="">Disponibilidad</option>
          <option value="true">Disponible</option>
          <option value="false">No disponible</option>
        </select>
        <button class="primary" (click)="cargarProfesionales()">Aplicar</button>
      </div>

      <div class="table-wrap" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Titulo</th>
              <th>Modalidad</th>
              <th>Tarifa</th>
              <th>Disponibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let profesional of profesionales">
              <td><span class="record-id">PRO-{{ profesional.id }}</span></td>
              <td>{{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}</td>
              <td>{{ profesional.tituloProfesional }}</td>
              <td>{{ profesional.modalidad }}</td>
              <td>{{ profesional.tarifaBase }}</td>
              <td>{{ profesional.disponible ? 'Disponible' : 'No disponible' }}</td>
              <td class="actions">
                <button (click)="editar(profesional)">Editar</button>
                <button (click)="toggleDisponibilidad(profesional)">Cambiar disponibilidad</button>
                <a [routerLink]="['/profesionales', profesional.id]">Detalle</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p *ngIf="loading" class="status">Cargando profesionales...</p>
      <p *ngIf="error" class="status error">{{ error }}</p>
    </section>

    <section class="card" style="margin-top: 1rem">
      <div class="module-head">
        <span class="module-id">FORM-PRO</span>
        <h3>{{ editandoId ? 'Editar profesional' : 'Crear profesional' }}</h3>
      </div>
      <form (ngSubmit)="guardar()" class="form-grid">
        <input [(ngModel)]="form.nombre" name="nombre" placeholder="Nombre" required />
        <input [(ngModel)]="form.apellidos" name="apellidos" placeholder="Apellidos" required />
        <input [(ngModel)]="form.email" name="email" placeholder="Correo" required />
        <input [(ngModel)]="form.telefono" name="telefono" placeholder="Telefono" />
        <input [(ngModel)]="form.password" name="password" placeholder="Password temporal" [required]="!editandoId" />
        <input [(ngModel)]="form.tituloProfesional" name="tituloProfesional" placeholder="Titulo profesional" required />
        <input [(ngModel)]="form.aniosExperiencia" type="number" name="aniosExperiencia" placeholder="Anios experiencia" required min="0" />
        <input [(ngModel)]="form.tarifaBase" type="number" name="tarifaBase" placeholder="Tarifa base" required min="1" />
        <select [(ngModel)]="form.modalidad" name="modalidad" required>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <input [(ngModel)]="form.provincia" name="provincia" placeholder="Provincia" required />
        <input [(ngModel)]="form.canton" name="canton" placeholder="Canton" required />
        <input [(ngModel)]="form.distrito" name="distrito" placeholder="Distrito" required />
        <input [(ngModel)]="form.imagenPerfil" name="imagenPerfil" placeholder="Imagen perfil (url/archivo)" />
        <select [(ngModel)]="form.disponible" name="disponible">
          <option [ngValue]="true">Disponible</option>
          <option [ngValue]="false">No disponible</option>
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
          <button class="primary" type="submit">{{ editandoId ? 'Guardar cambios' : 'Crear profesional' }}</button>
          <button type="button" (click)="limpiarFormulario()">Limpiar</button>
        </div>
      </form>
    </section>
  `,
})
export class ProfesionalesPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  profesionales: Profesional[] = [];
  especialidades: Especialidad[] = [];
  loading = false;
  error = '';

  search = '';
  modalidadFiltro = '';
  disponibleFiltro = '';

  editandoId: number | null = null;
  especialidadSeleccionada: number | null = null;

  form: ProfesionalPayload = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    tituloProfesional: '',
    descripcion: '',
    aniosExperiencia: 0,
    modalidad: 'MIXTA',
    provincia: '',
    canton: '',
    distrito: '',
    tarifaBase: 1,
    disponible: true,
    imagenPerfil: '',
    especialidadIds: [],
  };

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarProfesionales();
  }

  cargarEspecialidades(): void {
    this.api.getEspecialidades().subscribe((data) => {
      this.especialidades = data;
    });
  }

  cargarProfesionales(): void {
    this.loading = true;
    this.error = '';

    const params: Record<string, string> = {};
    if (this.search.trim()) params['search'] = this.search.trim();
    if (this.modalidadFiltro) params['modalidad'] = this.modalidadFiltro;
    if (this.disponibleFiltro) params['disponible'] = this.disponibleFiltro;

    this.api.getProfesionales(params).subscribe({
      next: (data) => {
        this.profesionales = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los profesionales.';
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

  editar(profesional: Profesional): void {
    this.editandoId = profesional.id;
    this.form = {
      nombre: profesional.usuario.nombre,
      apellidos: profesional.usuario.apellidos,
      email: profesional.usuario.email,
      telefono: profesional.usuario.telefono || '',
      tituloProfesional: profesional.tituloProfesional,
      descripcion: profesional.descripcion,
      aniosExperiencia: profesional.aniosExperiencia,
      modalidad: profesional.modalidad,
      provincia: profesional.provincia,
      canton: profesional.canton,
      distrito: profesional.distrito,
      tarifaBase: Number(profesional.tarifaBase),
      disponible: profesional.disponible,
      imagenPerfil: profesional.imagenPerfil,
      especialidadIds: [],
    };
  }

  guardar(): void {
    if (this.form.tarifaBase <= 0 || this.form.aniosExperiencia < 0) {
      this.error = 'Tarifa y experiencia deben ser validas.';
      return;
    }

    const request = this.editandoId
      ? this.api.updateProfesional(this.editandoId, this.form)
      : this.api.createProfesional(this.form);

    request.subscribe({
      next: () => {
        this.limpiarFormulario();
        this.cargarProfesionales();
      },
      error: () => {
        this.error = 'No fue posible guardar el profesional.';
      },
    });
  }

  toggleDisponibilidad(profesional: Profesional): void {
    const siguiente = !profesional.disponible;
    if (!confirm(`Confirma marcar como ${siguiente ? 'disponible' : 'no disponible'}?`)) return;

    this.api.setDisponibilidadProfesional(profesional.id, siguiente).subscribe({
      next: () => this.cargarProfesionales(),
      error: () => {
        this.error = 'No fue posible actualizar la disponibilidad.';
      },
    });
  }

  limpiarFormulario(): void {
    this.editandoId = null;
    this.form = {
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      telefono: '',
      tituloProfesional: '',
      descripcion: '',
      aniosExperiencia: 0,
      modalidad: 'MIXTA',
      provincia: '',
      canton: '',
      distrito: '',
      tarifaBase: 1,
      disponible: true,
      imagenPerfil: '',
      especialidadIds: [],
    };
  }
}

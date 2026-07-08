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

      <div class="summary">
        <span>Total: {{ profesionales.length }}</span>
        <span>Disponibles: {{ contarPorDisponibilidad(true) }}</span>
        <span>No disponibles: {{ contarPorDisponibilidad(false) }}</span>
      </div>

      <div class="toolbar">
        <input [(ngModel)]="search" (keydown.enter)="aplicarFiltrosLocales()" placeholder="Buscar por nombre" />
        <select [(ngModel)]="profesionalSeleccionadoId">
          <option [ngValue]="null">Todos los profesionales</option>
          <option *ngFor="let item of todosProfesionales" [ngValue]="item.id">
            {{ item.usuario.nombre }} {{ item.usuario.apellidos }}
          </option>
        </select>
        <select [(ngModel)]="modalidadFiltro">
          <option value="">Todas las modalidades</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <select [(ngModel)]="disponibleFiltro">
          <option value="">Todas las disponibilidades</option>
          <option value="true">Disponible</option>
          <option value="false">No disponible</option>
        </select>
        <button class="primary" (click)="aplicarFiltrosLocales()">Aplicar filtros</button>
        <button type="button" (click)="limpiarFiltros()">Limpiar</button>
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
              <td><span class="pill modalidad">{{ profesional.modalidad }}</span></td>
              <td>{{ profesional.tarifaBase }}</td>
              <td>
                <span class="pill" [class.off]="!profesional.disponible">
                  {{ profesional.disponible ? 'Disponible' : 'No disponible' }}
                </span>
              </td>
              <td class="actions">
                <button (click)="editar(profesional)">Editar</button>
                <button (click)="toggleDisponibilidad(profesional)">Cambiar disponibilidad</button>
                <a class="detail-link" [routerLink]="['/profesionales', profesional.id]">Detalle</a>
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
    `,
  ],
})
export class ProfesionalesPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  todosProfesionales: Profesional[] = [];
  profesionales: Profesional[] = [];
  especialidades: Especialidad[] = [];
  loading = false;
  error = '';

  search = '';
  profesionalSeleccionadoId: number | null = null;
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

    this.api.getProfesionales().subscribe({
      next: (data) => {
        this.todosProfesionales = data;
        this.aplicarFiltrosLocales();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los profesionales.';
        this.loading = false;
      },
    });
  }

  aplicarFiltrosLocales(): void {
    const search = this.search.trim().toLowerCase();

    this.profesionales = this.todosProfesionales.filter((profesional) => {
      const nombreCompleto = `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`.toLowerCase();
      const matchSearch = !search || nombreCompleto.includes(search);
      const matchProfesional = !this.profesionalSeleccionadoId || profesional.id === this.profesionalSeleccionadoId;
      const matchModalidad = !this.modalidadFiltro || profesional.modalidad === this.modalidadFiltro;
      const matchDisponible =
        !this.disponibleFiltro || String(profesional.disponible) === this.disponibleFiltro;

      return matchSearch && matchProfesional && matchModalidad && matchDisponible;
    });
  }

  limpiarFiltros(): void {
    this.search = '';
    this.profesionalSeleccionadoId = null;
    this.modalidadFiltro = '';
    this.disponibleFiltro = '';
    this.aplicarFiltrosLocales();
  }

  contarPorDisponibilidad(disponible: boolean): number {
    return this.profesionales.filter((p) => p.disponible === disponible).length;
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

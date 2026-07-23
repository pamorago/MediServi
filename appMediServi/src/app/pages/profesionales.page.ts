import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
      <p>Gestión de profesionales con filtros, formulario de registro/edición y cambio de disponibilidad.</p>

      <div class="summary">
        <span>Total: {{ profesionales.length }}</span>
        <span>Disponibles: {{ contarPorDisponibilidad(true) }}</span>
        <span>No disponibles: {{ contarPorDisponibilidad(false) }}</span>
      </div>

      <div class="toolbar">
        <input [(ngModel)]="search" (input)="aplicarFiltrosLocales()" placeholder="Buscar por nombre..." />
        <select [(ngModel)]="modalidadFiltro" (change)="aplicarFiltrosLocales()">
          <option value="">Todas las modalidades</option>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <select [(ngModel)]="disponibleFiltro" (change)="aplicarFiltrosLocales()">
          <option value="">Todas las disponibilidades</option>
          <option value="true">Disponible</option>
          <option value="false">No disponible</option>
        </select>
        <button type="button" class="btn-outline" (click)="limpiarFiltros()">Limpiar filtros</button>
      </div>

      <div *ngIf="loading" class="status-box loading">Cargando profesionales...</div>
      <div *ngIf="error" class="status-box error">{{ error }}</div>

      @if (!loading) {
      <div class="table-wrap">
        @if (profesionales.length === 0 && !error) {
        <p class="empty-msg">No se encontraron profesionales con los filtros aplicados.</p>
        }
        @if (profesionales.length > 0) {
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Título</th>
              <th>Modalidad</th>
              <th>Tarifa</th>
              <th>Disponibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of profesionales; track p.id) {
            <tr>
              <td><span class="record-id">PRO-{{ p.id }}</span></td>
              <td>{{ p.usuario.nombre }} {{ p.usuario.apellidos }}</td>
              <td>{{ p.tituloProfesional }}</td>
              <td><span class="pill modalidad">{{ p.modalidad }}</span></td>
              <td>₡{{ p.tarifaBase | number }}</td>
              <td>
                <span class="pill" [class.off]="!p.disponible">
                  {{ p.disponible ? 'Disponible' : 'No disponible' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-sm" (click)="editar(p)">Editar</button>
                <button class="btn-sm btn-warn" (click)="toggleDisponibilidad(p)">
                  {{ p.disponible ? 'Desactivar' : 'Activar' }}
                </button>
                <a class="detail-link" [routerLink]="['/profesionales', p.id]">Ver detalle</a>
              </td>
            </tr>
            }
          </tbody>
        </table>
        }
      </div>
      }
    </section>

    <section class="card" style="margin-top:1rem">
      <div class="module-head">
        <span class="module-id">FORM-PRO</span>
        <h3>{{ editandoId ? 'Editar profesional #' + editandoId : 'Registrar profesional' }}</h3>
      </div>

      <div *ngIf="formError" class="status-box error">{{ formError }}</div>
      <div *ngIf="formExito" class="status-box success">{{ formExito }}</div>

      <form (ngSubmit)="guardar()" #formPro="ngForm" class="form-grid" novalidate>

        <div class="field">
          <label>Nombre *</label>
          <input [(ngModel)]="form.nombre" name="nombre" required #nombre="ngModel"
                 placeholder="Nombre del profesional" />
          @if (nombre.invalid && nombre.touched) {
          <span class="field-error">El nombre es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label>Apellidos *</label>
          <input [(ngModel)]="form.apellidos" name="apellidos" required #apellidos="ngModel"
                 placeholder="Apellidos" />
          @if (apellidos.invalid && apellidos.touched) {
          <span class="field-error">Los apellidos son obligatorios.</span>
          }
        </div>

        <div class="field">
          <label>Correo electrónico *</label>
          <input [(ngModel)]="form.email" name="email" type="email" required #email="ngModel"
                 placeholder="correo@ejemplo.com" />
          @if (email.invalid && email.touched) {
          <span class="field-error">Ingrese un correo válido.</span>
          }
        </div>

        <div class="field">
          <label>Teléfono</label>
          <input [(ngModel)]="form.telefono" name="telefono" placeholder="Número de teléfono" />
        </div>

        @if (!editandoId) {
        <div class="field">
          <label>Contraseña *</label>
          <input [(ngModel)]="form.password" name="password" type="password"
                 [required]="!editandoId" #pwd="ngModel" placeholder="Contraseña temporal" />
          @if (pwd.invalid && pwd.touched) {
          <span class="field-error">La contraseña es obligatoria.</span>
          }
        </div>
        }

        <div class="field">
          <label>Título profesional *</label>
          <input [(ngModel)]="form.tituloProfesional" name="tituloProfesional" required
                 #titulo="ngModel" placeholder="Ej: Médico General" />
          @if (titulo.invalid && titulo.touched) {
          <span class="field-error">El título es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label>Años de experiencia *</label>
          <input [(ngModel)]="form.aniosExperiencia" name="aniosExperiencia" type="number"
                 required min="0" #exp="ngModel" placeholder="0" />
          @if (exp.invalid && exp.touched) {
          <span class="field-error">Ingrese un valor válido (≥ 0).</span>
          }
        </div>

        <div class="field">
          <label>Tarifa base (₡) *</label>
          <input [(ngModel)]="form.tarifaBase" name="tarifaBase" type="number"
                 required min="1" #tarifa="ngModel" placeholder="0" />
          @if (tarifa.invalid && tarifa.touched) {
          <span class="field-error">La tarifa debe ser mayor a cero.</span>
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
          <label>Disponibilidad</label>
          <select [(ngModel)]="form.disponible" name="disponible">
            <option [ngValue]="true">Disponible</option>
            <option [ngValue]="false">No disponible</option>
          </select>
        </div>

        <div class="field">
          <label>Provincia *</label>
          <input [(ngModel)]="form.provincia" name="provincia" required #prov="ngModel"
                 placeholder="Ej: San José" />
          @if (prov.invalid && prov.touched) {
          <span class="field-error">La provincia es obligatoria.</span>
          }
        </div>

        <div class="field">
          <label>Cantón *</label>
          <input [(ngModel)]="form.canton" name="canton" required #canton="ngModel"
                 placeholder="Ej: Central" />
          @if (canton.invalid && canton.touched) {
          <span class="field-error">El cantón es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label>Distrito *</label>
          <input [(ngModel)]="form.distrito" name="distrito" required #distrito="ngModel"
                 placeholder="Ej: Carmen" />
          @if (distrito.invalid && distrito.touched) {
          <span class="field-error">El distrito es obligatorio.</span>
          }
        </div>

        <div class="field full">
          <label>Descripción *</label>
          <textarea [(ngModel)]="form.descripcion" name="descripcion" required #desc="ngModel"
                    rows="3" placeholder="Descripción del profesional..."></textarea>
          @if (desc.invalid && desc.touched) {
          <span class="field-error">La descripción es obligatoria.</span>
          }
        </div>

        <div class="field full">
          <label>Imagen de perfil</label>
          <input type="file" accept="image/jpeg,image/png,image/webp"
                 (change)="seleccionarImagen($event)" />
          @if (imagenPreview) {
          <div class="img-preview">
            <img [src]="imagenPreview" alt="Vista previa" />
          </div>
          } @else if (form.imagenPerfil) {
          <div class="img-preview">
            <img [src]="api.getImageUrl(form.imagenPerfil)" alt="Imagen actual" />
            <span class="muted">Imagen actual: {{ form.imagenPerfil }}</span>
          </div>
          }
          @if (subiendoImagen) {
          <div class="status-box loading">Subiendo imagen...</div>
          }
        </div>

        <div class="field full">
          <label>Especialidades asociadas</label>
          <div class="inline-add">
            <select [(ngModel)]="especialidadSeleccionada" name="especialidadSeleccionada">
              <option [ngValue]="null">— Seleccionar especialidad —</option>
              @for (e of especialidades; track e.id) {
              <option [ngValue]="e.id">{{ e.nombre }}</option>
              }
            </select>
            <button type="button" class="btn-outline" (click)="agregarEspecialidad()">Agregar</button>
          </div>

          @if (especialidadesSeleccionadas.length > 0) {
          <div class="tags-list">
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
            {{ guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear profesional') }}
          </button>
          <button type="button" class="btn-outline" (click)="limpiarFormulario()">Cancelar</button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .summary { display:flex; flex-wrap:wrap; gap:.6rem; margin-top:.65rem; }
    .summary span {
      border:1px solid var(--color-outline); border-radius:999px;
      background:var(--color-soft); font-size:.82rem; padding:.2rem .55rem;
    }
    .pill {
      display:inline-block; border-radius:999px; padding:.2rem .55rem;
      font-size:.72rem; font-weight:700; color:#2d5b4f; background:#e3f3ee;
    }
    .pill.off { color:#7a1c1c; background:#fbe6e6; }
    .pill.modalidad { color:#234f45; background:#edf7f3; }
    .detail-link { color:#25695a; font-weight:700; text-decoration:none; }
    .detail-link:hover { text-decoration:underline; }
    .field { display:flex; flex-direction:column; gap:.3rem; }
    .field label { font-size:.82rem; font-weight:600; color:var(--color-text); }
    .field-error { font-size:.78rem; color:#c0392b; margin-top:.1rem; }
    .status-box {
      border-radius:10px; padding:.6rem .9rem; margin:.5rem 0; font-size:.88rem;
    }
    .status-box.loading { background:#f0f7ff; color:#1a5276; border:1px solid #aed6f1; }
    .status-box.error { background:#fdf2f2; color:#c0392b; border:1px solid #f5b7b1; }
    .status-box.success { background:#f0faf5; color:#1e8449; border:1px solid #a9dfbf; }
    .empty-msg { color:var(--color-subtle); padding:1rem 0; text-align:center; }
    .btn-sm { font-size:.78rem; padding:.25rem .6rem; }
    .btn-warn { background:#fef9f0; color:#9a6c00; border:1px solid #f0c580; }
    .btn-warn:hover { background:#fbebd2; }
    .btn-outline { background:transparent; border:1px solid var(--color-outline); color:var(--color-text); }
    .btn-outline:hover { background:var(--color-soft); }
    .inline-add { display:flex; gap:.5rem; align-items:center; }
    .inline-add select { flex:1; }
    .tags-list { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.5rem; }
    .tag {
      display:inline-flex; align-items:center; gap:.3rem;
      border-radius:999px; padding:.2rem .6rem; font-size:.78rem;
      font-weight:700; color:#28594d; background:#e4f3ed;
    }
    .tag-remove {
      background:none; border:none; cursor:pointer; font-size:.7rem;
      color:#28594d; padding:0; line-height:1;
    }
    .tag-remove:hover { color:#c0392b; }
    .img-preview { margin-top:.5rem; display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }
    .img-preview img { width:64px; height:64px; border-radius:8px; object-fit:cover; border:1px solid var(--color-outline); }
    .muted { color:var(--color-subtle); font-size:.82rem; }
  `],
})
export class ProfesionalesPageComponent implements OnInit {
  @ViewChild('formPro') formPro!: NgForm;
  readonly api = inject(ApiService);
  private readonly apiSvc = inject(ApiService);

  todosProfesionales: Profesional[] = [];
  profesionales: Profesional[] = [];
  especialidades: Especialidad[] = [];
  loading = false;
  error = '';
  formError = '';
  formExito = '';
  guardando = false;
  subiendoImagen = false;

  search = '';
  modalidadFiltro = '';
  disponibleFiltro = '';

  editandoId: number | null = null;
  especialidadSeleccionada: number | null = null;
  especialidadesSeleccionadas: { id: number; nombre: string }[] = [];
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  form: ProfesionalPayload = this.formVacio();

  ngOnInit(): void {
    this.apiSvc.getEspecialidades().subscribe((data: Especialidad[]) => (this.especialidades = data));
    this.cargarProfesionales();
  }

  cargarProfesionales(): void {
    this.loading = true;
    this.error = '';
    this.apiSvc.getProfesionales().subscribe({
      next: (data: Profesional[]) => {
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
    const q = this.search.trim().toLowerCase();
    this.profesionales = this.todosProfesionales.filter((p) => {
      const nombre = `${p.usuario.nombre} ${p.usuario.apellidos}`.toLowerCase();
      return (
        (!q || nombre.includes(q)) &&
        (!this.modalidadFiltro || p.modalidad === this.modalidadFiltro) &&
        (!this.disponibleFiltro || String(p.disponible) === this.disponibleFiltro)
      );
    });
  }

  limpiarFiltros(): void {
    this.search = '';
    this.modalidadFiltro = '';
    this.disponibleFiltro = '';
    this.aplicarFiltrosLocales();
  }

  contarPorDisponibilidad(disponible: boolean): number {
    return this.todosProfesionales.filter((p) => p.disponible === disponible).length;
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imagenFile = file;
    const reader = new FileReader();
    reader.onload = (e) => (this.imagenPreview = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  agregarEspecialidad(): void {
    if (!this.especialidadSeleccionada) return;
    const yaExiste = this.especialidadesSeleccionadas.some(
      (e) => e.id === this.especialidadSeleccionada,
    );
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

  editar(p: Profesional): void {
    this.editandoId = p.id;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.form = {
      nombre: p.usuario.nombre,
      apellidos: p.usuario.apellidos,
      email: p.usuario.email,
      telefono: p.usuario.telefono ?? '',
      password: '',
      tituloProfesional: p.tituloProfesional,
      descripcion: p.descripcion,
      aniosExperiencia: p.aniosExperiencia,
      modalidad: p.modalidad,
      provincia: p.provincia,
      canton: p.canton,
      distrito: p.distrito,
      tarifaBase: Number(p.tarifaBase),
      disponible: p.disponible,
      imagenPerfil: p.imagenPerfil,
      especialidadIds: [],
    };
    this.especialidadesSeleccionadas =
      p.especialidades?.map((e) => ({ id: e.especialidadId, nombre: e.especialidad.nombre })) ?? [];
    this.form.especialidadIds = this.especialidadesSeleccionadas.map((e) => e.id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  guardar(): void {
    this.formPro?.form.markAllAsTouched();
    this.formError = '';
    this.formExito = '';
    if (this.formPro?.invalid) {
      this.formError = 'Completá todos los campos requeridos antes de guardar.';
      return;
    }

    if (this.form.tarifaBase <= 0) {
      this.formError = 'La tarifa base debe ser mayor a cero.';
      return;
    }
    if (this.form.aniosExperiencia < 0) {
      this.formError = 'Los años de experiencia no pueden ser negativos.';
      return;
    }

    if (this.imagenFile) {
      this.subiendoImagen = true;
      this.guardando = true;
      this.apiSvc
        .uploadImagenPerfil(this.imagenFile, this.editandoId ? this.form.imagenPerfil : undefined)
        .subscribe({
          next: ({ fileName }: { fileName: string }) => {
            this.subiendoImagen = false;
            this.form.imagenPerfil = fileName;
            this.persistirProfesional();
          },
          error: () => {
            this.subiendoImagen = false;
            this.guardando = false;
            this.formError = 'No se pudo subir la imagen. Intente de nuevo.';
          },
        });
    } else {
      this.persistirProfesional();
    }
  }

  private persistirProfesional(): void {
    this.guardando = true;
    const req = this.editandoId
      ? this.apiSvc.updateProfesional(this.editandoId, this.form)
      : this.apiSvc.createProfesional(this.form);

    req.subscribe({
      next: () => {
        this.formExito = this.editandoId
          ? 'Profesional actualizado correctamente.'
          : 'Profesional creado correctamente.';
        this.limpiarFormulario();
        this.cargarProfesionales();
        this.guardando = false;
      },
      error: () => {
        this.formError = 'No fue posible guardar el profesional. Verifique los datos.';
        this.guardando = false;
      },
    });
  }

  toggleDisponibilidad(p: Profesional): void {
    const siguiente = !p.disponible;
    if (!confirm(`¿Confirma marcar a ${p.usuario.nombre} como ${siguiente ? 'disponible' : 'no disponible'}?`)) return;

    this.apiSvc.setDisponibilidadProfesional(p.id, siguiente).subscribe({
      next: () => {
        this.formExito = `Disponibilidad actualizada correctamente.`;
        this.cargarProfesionales();
      },
      error: () => (this.error = 'No fue posible actualizar la disponibilidad.'),
    });
  }

  limpiarFormulario(): void {
    this.editandoId = null;
    this.imagenFile = null;
    this.imagenPreview = null;
    this.especialidadesSeleccionadas = [];
    this.especialidadSeleccionada = null;
    this.form = this.formVacio();
    this.formError = '';
    setTimeout(() => this.formPro?.resetForm());
  }

  private formVacio(): ProfesionalPayload {
    return {
      nombre: '', apellidos: '', email: '', password: '', telefono: '',
      tituloProfesional: '', descripcion: '', aniosExperiencia: 0,
      modalidad: 'MIXTA', provincia: '', canton: '', distrito: '',
      tarifaBase: 1, disponible: true, imagenPerfil: '', especialidadIds: [],
    };
  }
}

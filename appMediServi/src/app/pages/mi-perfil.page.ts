import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-mi-perfil-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="card perfil-card">
      <div class="module-head">
        <span class="module-id">MOD-PERFIL</span>
        <h2>Mi cuenta</h2>
      </div>
      <p>Actualizá tu nombre, apellidos, teléfono y foto de perfil. El correo y el rol no se pueden cambiar desde aquí.</p>

      <form (ngSubmit)="guardar(formPerfil)" #formPerfil="ngForm" class="form-grid" novalidate>
        <div class="field full">
          <label>Foto de perfil</label>
          <div class="foto-row">
            @if (imagenPreview) {
            <img class="foto-preview" [src]="imagenPreview" alt="Vista previa" />
            } @else if (usuarioActual?.imagenPerfil) {
            <img class="foto-preview" [src]="api.getImageUrl(usuarioActual!.imagenPerfil!)" alt="Foto actual" />
            } @else {
            <div class="foto-placeholder">Sin foto</div>
            }
            <div class="foto-controls">
              <input type="file" accept="image/jpeg,image/png,image/webp" (change)="seleccionarImagen($event)" />
              @if (subiendoImagen) {
              <span class="field-hint">Subiendo imagen...</span>
              }
            </div>
          </div>
        </div>

        <div class="field">
          <label for="nombre">Nombre *</label>
          <input id="nombre" [(ngModel)]="form.nombre" name="nombre" required #nombreCtrl="ngModel" />
          @if (nombreCtrl.invalid && nombreCtrl.touched) {
          <span class="field-error">El nombre es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label for="apellidos">Apellidos *</label>
          <input id="apellidos" [(ngModel)]="form.apellidos" name="apellidos" required #apellidosCtrl="ngModel" />
          @if (apellidosCtrl.invalid && apellidosCtrl.touched) {
          <span class="field-error">Los apellidos son obligatorios.</span>
          }
        </div>

        <div class="field">
          <label for="telefono">Teléfono</label>
          <input id="telefono" [(ngModel)]="form.telefono" name="telefono" placeholder="Opcional" />
        </div>

        <div class="field">
          <label>Correo</label>
          <input [value]="usuarioActual?.email" type="text" disabled />
          <span class="field-hint">El correo no se puede modificar desde esta pantalla.</span>
        </div>

        <div class="field">
          <label>Rol</label>
          <input [value]="usuarioActual?.rol" type="text" disabled />
        </div>

        @if (errorMessage) {
        <div class="status-box error full">{{ errorMessage }}</div>
        }
        @if (successMessage) {
        <div class="status-box success full">{{ successMessage }}</div>
        }

        <div class="full actions">
          <button type="submit" class="primary" [disabled]="guardando">
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.9rem;
        margin-top: 1rem;
        max-width: 640px;
      }

      .field { display: flex; flex-direction: column; gap: 0.3rem; }
      .field label { font-size: 0.82rem; font-weight: 600; }
      .field input {
        font: inherit;
        border: 1px solid var(--color-outline);
        border-radius: 8px;
        padding: 0.55rem 0.65rem;
      }
      .field input:disabled { background: var(--color-soft); color: var(--color-subtle); }
      .field-hint { font-size: 0.78rem; color: var(--color-subtle); }
      .field-error { font-size: 0.78rem; color: #c0392b; }

      .foto-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
      .foto-preview {
        width: 84px;
        height: 84px;
        border-radius: 999px;
        object-fit: cover;
        border: 1px solid var(--color-outline);
      }
      .foto-placeholder {
        width: 84px;
        height: 84px;
        border-radius: 999px;
        border: 1px dashed var(--color-outline);
        background: var(--color-soft);
        color: var(--color-subtle);
        font-size: 0.72rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .foto-controls { display: flex; flex-direction: column; gap: 0.3rem; }

      .full { grid-column: 1 / -1; }

      .status-box {
        border-radius: 10px;
        padding: 0.7rem 1rem;
        font-size: 0.88rem;
      }
      .status-box.error { background: #fdf2f2; color: #c0392b; border: 1px solid #f5b7b1; }
      .status-box.success { background: #f0faf5; color: #1e8449; border: 1px solid #a9dfbf; }

      .actions { display: flex; justify-content: flex-start; }

      @media (max-width: 640px) {
        .form-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class MiPerfilPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  readonly api = inject(ApiService);

  form = { nombre: '', apellidos: '', telefono: '' };
  guardando = false;
  subiendoImagen = false;
  errorMessage = '';
  successMessage = '';
  imagenPreview: string | null = null;
  private imagenFile: File | null = null;

  get usuarioActual() {
    return this.authService.usuario();
  }

  ngOnInit(): void {
    const usuario = this.usuarioActual;
    this.form = {
      nombre: usuario?.nombre ?? '',
      apellidos: usuario?.apellidos ?? '',
      telefono: usuario?.telefono ?? '',
    };
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

  guardar(formRef: NgForm): void {
    formRef.form.markAllAsTouched();
    this.errorMessage = '';
    this.successMessage = '';
    if (formRef.invalid) {
      this.errorMessage = 'Completá los campos obligatorios.';
      return;
    }

    if (this.imagenFile) {
      this.subiendoImagen = true;
      this.guardando = true;
      const previousFileName = this.usuarioActual?.imagenPerfil ?? undefined;
      this.api.uploadImagenPerfil(this.imagenFile, previousFileName).subscribe({
        next: ({ fileName }) => {
          this.subiendoImagen = false;
          this.persistirPerfil(fileName);
        },
        error: () => {
          this.subiendoImagen = false;
          this.guardando = false;
          this.errorMessage = 'No se pudo subir la imagen. Intentá de nuevo.';
        },
      });
    } else {
      this.persistirPerfil();
    }
  }

  private persistirPerfil(imagenPerfil?: string): void {
    this.guardando = true;
    this.authService
      .updateProfile({
        nombre: this.form.nombre.trim(),
        apellidos: this.form.apellidos.trim(),
        telefono: this.form.telefono?.trim() || undefined,
        ...(imagenPerfil ? { imagenPerfil } : {}),
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.imagenFile = null;
          this.imagenPreview = null;
          this.successMessage = 'Tu perfil se actualizó correctamente.';
        },
        error: (err) => {
          this.guardando = false;
          this.errorMessage = err?.error?.message ?? 'No se pudo actualizar tu perfil.';
        },
      });
  }
}

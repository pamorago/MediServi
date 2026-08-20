import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/services/auth.service';
import { Cita, CitaPayload, Profesional, Servicio, Usuario } from '../core/models';

@Component({
  selector: 'app-citas-page',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule, RouterLink],
  template: `
    <section class="card">
      <div class="module-head">
        <span class="module-id">MOD-CIT</span>
        <h2>Citas</h2>
      </div>
      <p>Agenda clinica activa con estado de consulta, modalidad de atencion y monto estimado.</p>

      <div class="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="tab"
          [class.active]="vista === 'listar'"
          (click)="vista = 'listar'"
        >
          Listar
        </button>
        @if (puedeRegistrar) {
        <button
          type="button"
          role="tab"
          class="tab"
          [class.active]="vista === 'registrar'"
          (click)="vista = 'registrar'"
        >
          Registrar
        </button>
        }
      </div>
    </section>

    @if (vista === 'registrar' && puedeRegistrar) {
    <section class="card form-banner" style="margin-top: 1rem">
      <div class="module-head">
        <span class="module-id">FORM-CIT</span>
        <h3>Registrar cita</h3>
      </div>
      <form (ngSubmit)="crearCita(formCit)" #formCit="ngForm" class="form-grid" novalidate>

        <div class="field">
          <label>Cliente</label>
          <input [value]="nombreUsuarioActual" type="text" disabled />
          <span class="field-hint">Solicitás la cita a tu propio nombre.</span>
        </div>

        <div class="field">
          <label>Profesional *</label>
          <select [(ngModel)]="form.perfilProfesionalId" name="perfilProfesionalId" required #profCit="ngModel" (ngModelChange)="onProfesionalChange($event)">
            <option [ngValue]="0">— Seleccione profesional —</option>
            @for (profesional of profesionales; track profesional.id) {
            <option [ngValue]="profesional.id">
              {{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}
            </option>
            }
          </select>
          @if (profCit.invalid && profCit.touched) {
          <span class="field-error">El profesional es obligatorio.</span>
          }
        </div>

        <div class="field">
          <label>Servicio *</label>
          <select [(ngModel)]="form.servicioId" name="servicioId" required #svcCit="ngModel">
            <option [ngValue]="0">— Seleccione servicio —</option>
            @for (servicio of serviciosFiltrados; track servicio.id) {
            <option [ngValue]="servicio.id">{{ servicio.nombre }}</option>
            }
          </select>
          @if (svcCit.invalid && svcCit.touched) {
          <span class="field-error">El servicio es obligatorio.</span>
          }
          @if (!form.perfilProfesionalId) {
          <span class="field-hint">Primero seleccioná un profesional.</span>
          }
        </div>

        <div class="field">
          <label>Fecha *</label>
          <input [(ngModel)]="form.fechaCita" type="date" name="fechaCita" required #fechaCit="ngModel" />
          @if (fechaCit.invalid && fechaCit.touched) {
          <span class="field-error">La fecha es obligatoria.</span>
          }
        </div>

        <div class="field">
          <label>Hora de inicio *</label>
          <select [(ngModel)]="form.horaInicio" name="horaInicio" required #hInicioCit="ngModel">
            <option value="">— Seleccione hora —</option>
            @for (h of horasDisponibles; track h) {
            <option [value]="h">{{ h }}</option>
            }
          </select>
          @if (hInicioCit.invalid && hInicioCit.touched) {
          <span class="field-error">La hora de inicio es obligatoria.</span>
          }
        </div>

        <div class="field">
          <label>Hora de finalización</label>
          <input [value]="horaFinCalculada || 'Se calcula automáticamente'" type="text" disabled />
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
          <label>Monto estimado (₡)</label>
          <input [value]="montoEstimadoCalculado" type="text" disabled />
        </div>

        <div class="field full">
          <label>Descripción / Comentario *</label>
          <textarea [(ngModel)]="form.comentarioCliente" name="comentarioCliente" required #comentCit="ngModel"
                    rows="3" placeholder="Descripción de la cita..."></textarea>
          @if (comentCit.invalid && comentCit.touched) {
          <span class="field-error">La descripción es obligatoria.</span>
          }
        </div>

        @if (errorCita) {
        <div class="status-box error full">{{ errorCita }}</div>
        }
        @if (exitoCita) {
        <div class="status-box success full">{{ exitoCita }}</div>
        }

        <div class="full actions">
          <button type="submit" class="primary" [disabled]="guardandoCita">
            {{ guardandoCita ? 'Registrando...' : 'Registrar cita' }}
          </button>
        </div>
      </form>
    </section>
    }

    @if (vista === 'listar') {
    <section class="card module-banner cit-banner" style="margin-top: 1rem">
      <div class="module-head">
        <span class="module-id">LIST-CIT</span>
        <h2>{{ tituloListado }}</h2>
      </div>
      <p>{{ descripcionListado }}</p>

      <div class="toolbar">
        <select [(ngModel)]="estadoFiltro">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ACEPTADA">Aceptada</option>
          <option value="RECHAZADA">Rechazada</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="COMPLETADA">Completada</option>
        </select>
        @if (esAdministrador) {
        <select [(ngModel)]="profesionalFiltro">
          <option value="">Todos los profesionales</option>
          @for (profesional of profesionales; track profesional.id) {
          <option [value]="profesional.id">
            {{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}
          </option>
          }
        </select>
        }
        <input [(ngModel)]="fechaInicioFiltro" type="date" />
        <input [(ngModel)]="fechaFinFiltro" type="date" />
        <button class="primary" (click)="cargarCitas()">Aplicar filtros</button>
      </div>
    </section>

    @if (loading) {
    <p class="status">Cargando citas...</p>
    }
    @if (error) {
    <p class="status error">{{ error }}</p>
    }

    @if (!loading && !error) {
    @if (citas.length === 0) {
    <p class="status">No hay citas para mostrar con los filtros seleccionados.</p>
    }
    <section class="grid cards">
      @for (cita of citas; track cita.id) {
      <article class="card">
        <span class="record-id">CIT-{{ cita.id }}</span>
        <div class="line">
          <strong>Cliente</strong>
          <span>{{ cita.cliente?.nombre }} {{ cita.cliente?.apellidos }}</span>
        </div>
        <div class="line">
          <strong>Profesional</strong>
          <span>{{ cita.profesional?.usuario?.nombre }} {{ cita.profesional?.usuario?.apellidos }}</span>
        </div>
        <div class="line">
          <strong>Servicio</strong>
          <span>{{ cita.servicio?.nombre }}</span>
        </div>
        <div class="line">
          <strong>Estado</strong>
          <span>
            <span class="pill" [ngClass]="estadoCitaClass(cita.estado)">{{ cita.estado }}</span>
            @if (esCitaCalificable(cita)) {
            <span class="review-badge pending">Pendiente de calificar</span>
            } @else if (esCitaCalificada(cita)) {
            <span class="review-badge rated">Ya calificada</span>
            }
          </span>
        </div>
        <div class="line">
          <strong>Fecha</strong>
          <span>{{ cita.fechaCita | date: 'mediumDate' }}</span>
        </div>
        <div class="line">
          <strong>Hora</strong>
          <span>{{ cita.horaInicio | date: 'HH:mm' }} - {{ cita.horaFin | date: 'HH:mm' }}</span>
        </div>
        <div class="line">
          <strong>Modalidad</strong>
          <span>{{ cita.modalidad }}</span>
        </div>
        <div class="line">
          <strong>Monto</strong>
          <span>{{ cita.montoEstimado | currency: 'CRC' : 'symbol' : '1.0-0' }}</span>
        </div>
        <a class="detail-link" [routerLink]="['/citas', cita.id]">Ver detalle</a>
      </article>
      }
    </section>
    }
    }
  `,
  styles: [
    `
      .tabs {
        display: flex;
        gap: 0.4rem;
        margin-top: 0.85rem;
      }

      .tab {
        padding: 0.45rem 1rem;
        border-radius: 999px;
        border: 1px solid var(--color-outline);
        background: transparent;
        color: var(--color-text);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab:hover {
        background: var(--color-soft);
      }

      .tab.active {
        color: #224a40;
        border-color: transparent;
        background: linear-gradient(145deg, #dcefe8, #cfe4dc);
      }

      .cards {
        margin-top: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .form-banner {
        border-left: 5px solid #68a592;
        background: linear-gradient(165deg, #f9fdfb, #f0f8f4);
      }

      .field { display:flex; flex-direction:column; gap:.3rem; }
      .field label { font-size:.82rem; font-weight:600; color:var(--color-text); }
      .field-error { font-size:.78rem; color:#c0392b; margin-top:.1rem; }
      .field-hint { font-size:.78rem; color:var(--color-subtle); margin-top:.1rem; }
      .status-box { border-radius:10px; padding:.6rem .9rem; font-size:.88rem; }
      .status-box.error { background:#fdf2f2; color:#c0392b; border:1px solid #f5b7b1; }
      .status-box.success { background:#f0faf5; color:#1e8449; border:1px solid #a9dfbf; }

      .module-banner {
        border-left: 5px solid #3d8874;
        background: linear-gradient(165deg, #f6fcfa, #eaf6f1);
      }

      .cit-banner .module-id {
        color: #2d6658;
      }

      .line {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.55rem;
      }

      .pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: #7a5b13;
        background: #f9efd2;
      }

      .pill.aceptada {
        color: #1f5a49;
        background: #dff3ec;
      }

      .pill.rechazada,
      .pill.cancelada {
        color: #7a1c1c;
        background: #fbe6e6;
      }

      .pill.completada {
        color: #2a445f;
        background: #e3ecf8;
      }

      .review-badge {
        display: block;
        width: fit-content;
        margin-top: .35rem;
        border-radius: 999px;
        padding: .18rem .5rem;
        font-size: .68rem;
        font-weight: 700;
      }

      .review-badge.pending { color: #8a5b08; background: #fff1c7; }
      .review-badge.rated { color: #176044; background: #dff3ec; }

      .detail-link {
        display: inline-block;
        margin-top: 0.4rem;
        color: #25695a;
        font-weight: 700;
        text-decoration: none;
      }

      .detail-link:hover {
        color: #1d5649;
        text-decoration: underline;
      }

      @media (max-width: 900px) {
        .cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CitasPageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);

  vista: 'listar' | 'registrar' = 'listar';

  citas: Cita[] = [];
  clientes: Usuario[] = [];
  profesionales: Profesional[] = [];
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  horasDisponibles: string[] = [];
  loading = true;
  error = '';
  errorCita = '';
  exitoCita = '';
  guardandoCita = false;

  estadoFiltro = '';
  profesionalFiltro = '';
  fechaInicioFiltro = '';
  fechaFinFiltro = '';

  /** perfilProfesionalId propio, resuelto una vez cargada la lista de profesionales (solo rol PROFESIONAL) */
  private miPerfilProfesionalId: number | null = null;

  form: CitaPayload = {
    clienteId: 0,
    perfilProfesionalId: 0,
    servicioId: 0,
    fechaCita: '',
    horaInicio: '',
    modalidad: 'MIXTA',
    comentarioCliente: '',
  };

  get esAdministrador(): boolean {
    return this.authService.esAdmin();
  }

  /**
   * Solo el CLIENTE puede registrar una cita (a su propio nombre). El
   * administrador no debe crear citas como cliente y el profesional
   * gestiona solicitudes, no las crea.
   */
  get puedeRegistrar(): boolean {
    return this.authService.esCliente();
  }

  get nombreUsuarioActual(): string {
    const usuario = this.authService.usuario();
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : '';
  }

  get tituloListado(): string {
    if (this.esAdministrador) return 'Todas las citas';
    if (this.authService.esProfesional()) return 'Solicitudes recibidas';
    return 'Mis citas';
  }

  get descripcionListado(): string {
    if (this.esAdministrador) return 'Vista global de citas de todos los clientes y profesionales.';
    if (this.authService.esProfesional()) return 'Citas asignadas a tu perfil profesional.';
    return 'Tu historial de citas solicitadas.';
  }

  get montoEstimadoCalculado(): string {
    const servicio = this.serviciosFiltrados.find((s) => s.id === Number(this.form.servicioId))
      ?? this.servicios.find((s) => s.id === Number(this.form.servicioId));

    if (!servicio) {
      return 'Se calcula automáticamente';
    }

    return `₡${Number(servicio.precio).toLocaleString('es-CR')}`;
  }

  get horaFinCalculada(): string {
    if (!this.form.horaInicio) return '';
    const servicio = this.serviciosFiltrados.find((s) => s.id === Number(this.form.servicioId))
      ?? this.servicios.find((s) => s.id === Number(this.form.servicioId));
    const duracion = servicio?.duracionMinutos ?? 20;
    const [h, m] = this.form.horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m + duracion;
    const hFin = Math.floor(totalMin / 60);
    const mFin = totalMin % 60;
    return `${hFin.toString().padStart(2, '0')}:${mFin.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.generarHoras();

    const usuario = this.authService.usuario();
    if (usuario && this.authService.esCliente()) {
      this.form.clienteId = usuario.id;
    }

    if (this.esAdministrador) {
      this.api.getUsuarios({ rol: 'CLIENTE', estado: 'ACTIVO' }).subscribe((data) => {
        this.clientes = data;
      });
    }

    this.api.getProfesionales({ disponible: 'true' }).subscribe((data) => {
      this.profesionales = data;
      if (usuario && this.authService.esProfesional()) {
        this.miPerfilProfesionalId = data.find((p) => p.usuario.id === usuario.id)?.id ?? null;
      }
      this.cargarCitas();
    });

    this.api.getServicios({ estado: 'ACTIVO' }).subscribe((data) => {
      this.servicios = data;
    });
  }

  generarHoras(): void {
    const slots: string[] = [];
    for (let h = 8; h <= 20; h++) {
      slots.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 20) slots.push(`${h.toString().padStart(2, '0')}:30`);
    }
    this.horasDisponibles = slots;
  }

  onProfesionalChange(value: number | string): void {
    this.form.perfilProfesionalId = Number(value || 0);
    this.serviciosFiltrados = this.servicios.filter(
      (servicio) => Number(servicio.perfilProfesionalId) === Number(this.form.perfilProfesionalId),
    );
    this.form.servicioId = 0;
  }

  cargarCitas(): void {
    this.loading = true;
    const params: Record<string, string> = {};
    if (this.estadoFiltro) params['estado'] = this.estadoFiltro;
    if (this.fechaInicioFiltro) params['fechaInicio'] = this.fechaInicioFiltro;
    if (this.fechaFinFiltro) params['fechaFin'] = this.fechaFinFiltro;

    if (this.esAdministrador) {
      if (this.profesionalFiltro) params['perfilProfesionalId'] = this.profesionalFiltro;
    } else if (this.authService.esProfesional()) {
      // El profesional solo puede ver sus propias citas.
      if (this.miPerfilProfesionalId) {
        params['perfilProfesionalId'] = String(this.miPerfilProfesionalId);
      } else {
        // Aún no se resolvió su perfil: no mostramos nada en vez de exponer todo.
        this.citas = [];
        this.loading = false;
        return;
      }
    }
    // El API no expone un filtro por clienteId, así que a un CLIENTE se le
    // restringe la lista después de recibirla (ver filtrarPorRol).

    this.api.getCitasFiltradas(params).subscribe({
      next: (data) => {
        this.citas = this.filtrarPorRol(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las citas.';
        this.loading = false;
      },
    });
  }

  private filtrarPorRol(citas: Cita[]): Cita[] {
    if (!this.authService.esCliente()) return citas;
    const usuario = this.authService.usuario();
    if (!usuario) return [];
    return citas.filter((c) => c.clienteId === usuario.id || c.cliente?.id === usuario.id);
  }

  crearCita(formRef?: NgForm): void {
    if (formRef) formRef.form.markAllAsTouched();
    this.errorCita = '';
    this.exitoCita = '';
    if (formRef?.invalid) {
      this.errorCita = 'Completá todos los campos requeridos.';
      return;
    }

    const usuario = this.authService.usuario();
    if (!usuario) {
      this.errorCita = 'Tu sesión no es válida, volvé a iniciar sesión.';
      return;
    }

    this.guardandoCita = true;
    const payload: CitaPayload = {
      ...this.form,
      clienteId: usuario.id,
      perfilProfesionalId: Number(this.form.perfilProfesionalId),
      servicioId: Number(this.form.servicioId),
    };

    this.api.createCita(payload).subscribe({
      next: () => {
        this.exitoCita = 'Cita registrada correctamente.';
        this.guardandoCita = false;
        this.form = {
          clienteId: usuario.id,
          perfilProfesionalId: 0,
          servicioId: 0,
          fechaCita: '',
          horaInicio: '',
          modalidad: 'MIXTA',
          comentarioCliente: '',
        };
        this.serviciosFiltrados = [];
        setTimeout(() => formRef?.resetForm());
        this.vista = 'listar';
        this.cargarCitas();
      },
      error: () => {
        this.errorCita = 'No se pudo registrar la cita.';
        this.guardandoCita = false;
      },
    });
  }

  estadoCitaClass(estado: Cita['estado']): string {
    switch (estado) {
      case 'ACEPTADA':
        return 'aceptada';
      case 'RECHAZADA':
        return 'rechazada';
      case 'CANCELADA':
        return 'cancelada';
      case 'COMPLETADA':
        return 'completada';
      default:
        return 'pendiente';
    }
  }

  esCitaDelCliente(cita: Cita): boolean {
    const usuario = this.authService.usuario();
    return this.authService.esCliente() && usuario?.id === cita.clienteId;
  }

  esCitaCalificable(cita: Cita): boolean {
    return cita.estado === 'COMPLETADA' && this.esCitaDelCliente(cita) && !cita.resena;
  }

  esCitaCalificada(cita: Cita): boolean {
    return cita.estado === 'COMPLETADA' && this.esCitaDelCliente(cita) && !!cita.resena;
  }
}

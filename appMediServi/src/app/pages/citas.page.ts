import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Cita, CitaPayload, Profesional, Servicio, Usuario } from '../core/models';

@Component({
  selector: 'app-citas-page',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule, RouterLink],
  template: `
    <section class="card form-banner" style="margin-bottom: 1rem">
      <div class="module-head">
        <span class="module-id">FORM-CIT</span>
        <h3>Registrar cita</h3>
      </div>
      <form (ngSubmit)="crearCita(formCit)" #formCit="ngForm" class="form-grid" novalidate>

        <div class="field">
          <label>Cliente *</label>
          <select [(ngModel)]="form.clienteId" name="clienteId" required #clienteCit="ngModel">
            <option [ngValue]="0">— Seleccione cliente —</option>
            <option *ngFor="let cliente of clientes" [ngValue]="cliente.id">{{ cliente.nombre }} {{ cliente.apellidos }}</option>
          </select>
          <span class="field-error" *ngIf="clienteCit.invalid && clienteCit.touched">El cliente es obligatorio.</span>
        </div>

        <div class="field">
          <label>Profesional *</label>
          <select [(ngModel)]="form.perfilProfesionalId" name="perfilProfesionalId" required #profCit="ngModel" (ngModelChange)="onProfesionalChange($event)">
            <option [ngValue]="0">— Seleccione profesional —</option>
            <option *ngFor="let profesional of profesionales" [ngValue]="profesional.id">
              {{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}
            </option>
          </select>
          <span class="field-error" *ngIf="profCit.invalid && profCit.touched">El profesional es obligatorio.</span>
        </div>

        <div class="field">
          <label>Servicio *</label>
          <select [(ngModel)]="form.servicioId" name="servicioId" required #svcCit="ngModel">
            <option [ngValue]="0">— Seleccione servicio —</option>
            <option *ngFor="let servicio of serviciosFiltrados" [ngValue]="servicio.id">{{ servicio.nombre }}</option>
          </select>
          <span class="field-error" *ngIf="svcCit.invalid && svcCit.touched">El servicio es obligatorio.</span>
          <span class="field-hint" *ngIf="!form.perfilProfesionalId">Primero seleccioná un profesional.</span>
        </div>

        <div class="field">
          <label>Fecha *</label>
          <input [(ngModel)]="form.fechaCita" type="date" name="fechaCita" required #fechaCit="ngModel" />
          <span class="field-error" *ngIf="fechaCit.invalid && fechaCit.touched">La fecha es obligatoria.</span>
        </div>

        <div class="field">
          <label>Hora de inicio *</label>
          <select [(ngModel)]="form.horaInicio" name="horaInicio" required #hInicioCit="ngModel">
            <option value="">— Seleccione hora —</option>
            <option *ngFor="let h of horasDisponibles" [value]="h">{{ h }}</option>
          </select>
          <span class="field-error" *ngIf="hInicioCit.invalid && hInicioCit.touched">La hora de inicio es obligatoria.</span>
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
          <label>Monto estimado (₡) *</label>
          <input [(ngModel)]="form.montoEstimado" type="number" name="montoEstimado" min="1" required #montoCit="ngModel" placeholder="0" />
          <span class="field-error" *ngIf="montoCit.invalid && montoCit.touched">El monto debe ser mayor a cero.</span>
        </div>

        <div class="field full">
          <label>Descripción / Comentario *</label>
          <textarea [(ngModel)]="form.comentarioCliente" name="comentarioCliente" required #comentCit="ngModel"
                    rows="3" placeholder="Descripción de la cita..."></textarea>
          <span class="field-error" *ngIf="comentCit.invalid && comentCit.touched">La descripción es obligatoria.</span>
        </div>

        <div *ngIf="errorCita" class="status-box error full">{{ errorCita }}</div>
        <div *ngIf="exitoCita" class="status-box success full">{{ exitoCita }}</div>

        <div class="full actions">
          <button type="submit" class="primary" [disabled]="guardandoCita">
            {{ guardandoCita ? 'Registrando...' : 'Registrar cita' }}
          </button>
        </div>
      </form>
    </section>

    <section class="card module-banner cit-banner">
      <div class="module-head">
        <span class="module-id">MOD-CIT</span>
        <h2>Citas registradas</h2>
      </div>
      <p>Agenda clinica activa con estado de consulta, modalidad de atencion y monto estimado.</p>

      <div class="toolbar">
        <select [(ngModel)]="estadoFiltro">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="ACEPTADA">Aceptada</option>
          <option value="RECHAZADA">Rechazada</option>
          <option value="CANCELADA">Cancelada</option>
          <option value="COMPLETADA">Completada</option>
        </select>
        <select [(ngModel)]="profesionalFiltro">
          <option value="">Todos los profesionales</option>
          <option *ngFor="let profesional of profesionales" [value]="profesional.id">
            {{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}
          </option>
        </select>
        <input [(ngModel)]="fechaInicioFiltro" type="date" />
        <input [(ngModel)]="fechaFinFiltro" type="date" />
        <button class="primary" (click)="cargarCitas()">Aplicar filtros</button>
      </div>
    </section>

    <p *ngIf="loading" class="status">Cargando citas...</p>
    <p *ngIf="error" class="status error">{{ error }}</p>

    <section class="grid cards" *ngIf="!loading && !error">
      <article class="card" *ngFor="let cita of citas">
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
          <span class="pill" [ngClass]="estadoCitaClass(cita.estado)">{{ cita.estado }}</span>
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
    </section>
  `,
  styles: [
    `
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

  form: CitaPayload = {
    clienteId: 0,
    perfilProfesionalId: 0,
    servicioId: 0,
    fechaCita: '',
    horaInicio: '',
    horaFin: '',
    modalidad: 'MIXTA',
    montoEstimado: 1,
    comentarioCliente: '',
  };

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
    this.api.getUsuarios({ rol: 'CLIENTE', estado: 'ACTIVO' }).subscribe((data) => {
      this.clientes = data;
    });

    this.api.getProfesionales({ disponible: 'true' }).subscribe((data) => {
      this.profesionales = data;
    });

    this.api.getServicios({ estado: 'ACTIVO' }).subscribe((data) => {
      this.servicios = data;
    });

    this.cargarCitas();
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
    if (this.profesionalFiltro) params['perfilProfesionalId'] = this.profesionalFiltro;
    if (this.fechaInicioFiltro) params['fechaInicio'] = this.fechaInicioFiltro;
    if (this.fechaFinFiltro) params['fechaFin'] = this.fechaFinFiltro;

    this.api.getCitasFiltradas(params).subscribe({
      next: (data) => {
        this.citas = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las citas.';
        this.loading = false;
      },
    });
  }

  crearCita(formRef?: NgForm): void {
    if (formRef) formRef.form.markAllAsTouched();
    this.errorCita = '';
    this.exitoCita = '';
    if (formRef?.invalid) {
      this.errorCita = 'Completá todos los campos requeridos.';
      return;
    }
    this.form.horaFin = this.horaFinCalculada;

    this.guardandoCita = true;
    const payload: CitaPayload = {
      ...this.form,
      clienteId: Number(this.form.clienteId),
      perfilProfesionalId: Number(this.form.perfilProfesionalId),
      servicioId: Number(this.form.servicioId),
      montoEstimado: Number(this.form.montoEstimado),
    };

    this.api.createCita(payload).subscribe({
      next: () => {
        this.exitoCita = 'Cita registrada correctamente.';
        this.guardandoCita = false;
        this.form = {
          clienteId: 0,
          perfilProfesionalId: 0,
          servicioId: 0,
          fechaCita: '',
          horaInicio: '',
          horaFin: '',
          modalidad: 'MIXTA',
          montoEstimado: 1,
          comentarioCliente: '',
        };
        this.serviciosFiltrados = [];
        setTimeout(() => formRef?.resetForm());
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
}

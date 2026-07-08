import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
      <form (ngSubmit)="crearCita()" class="form-grid">
        <select [(ngModel)]="form.clienteId" name="clienteId" required>
          <option [ngValue]="0">Seleccione cliente</option>
          <option *ngFor="let cliente of clientes" [ngValue]="cliente.id">{{ cliente.nombre }} {{ cliente.apellidos }}</option>
        </select>
        <select [(ngModel)]="form.perfilProfesionalId" name="perfilProfesionalId" required (ngModelChange)="onProfesionalChange()">
          <option [ngValue]="0">Seleccione profesional</option>
          <option *ngFor="let profesional of profesionales" [ngValue]="profesional.id">
            {{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}
          </option>
        </select>
        <select [(ngModel)]="form.servicioId" name="servicioId" required>
          <option [ngValue]="0">Seleccione servicio</option>
          <option *ngFor="let servicio of serviciosFiltrados" [ngValue]="servicio.id">{{ servicio.nombre }}</option>
        </select>
        <input [(ngModel)]="form.fechaCita" type="date" name="fechaCita" required />
        <input [(ngModel)]="form.horaInicio" type="time" name="horaInicio" required />
        <input [(ngModel)]="form.horaFin" type="time" name="horaFin" required />
        <select [(ngModel)]="form.modalidad" name="modalidad" required>
          <option value="VIRTUAL">Virtual</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="MIXTA">Mixta</option>
        </select>
        <input [(ngModel)]="form.montoEstimado" type="number" name="montoEstimado" min="1" required placeholder="Monto estimado" />
        <textarea class="full" [(ngModel)]="form.comentarioCliente" name="comentarioCliente" rows="3" placeholder="Comentario o descripcion"></textarea>
        <div class="full actions">
          <button type="submit" class="primary">Registrar cita</button>
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
  loading = true;
  error = '';

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

  ngOnInit(): void {
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

  onProfesionalChange(): void {
    this.serviciosFiltrados = this.servicios.filter((servicio) => servicio.perfilProfesionalId === this.form.perfilProfesionalId);
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

  crearCita(): void {
    if (!this.form.clienteId || !this.form.perfilProfesionalId || !this.form.servicioId || !this.form.fechaCita || !this.form.horaInicio || !this.form.horaFin || !this.form.modalidad) {
      this.error = 'Complete todos los campos obligatorios del formulario de cita.';
      return;
    }

    this.api.createCita(this.form).subscribe({
      next: () => {
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
        this.cargarCitas();
      },
      error: () => {
        this.error = 'No se pudo registrar la cita.';
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

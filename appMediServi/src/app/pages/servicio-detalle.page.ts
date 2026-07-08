import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Servicio } from '../core/models';

@Component({
  selector: 'app-servicio-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="card" *ngIf="servicio">
      <h2>Detalle del servicio</h2>
      <p><strong>Nombre:</strong> {{ servicio.nombre }}</p>
      <p><strong>Categoria:</strong> {{ servicio.categoria?.nombre }}</p>
      <p><strong>Profesional:</strong> {{ servicio.perfil?.usuario?.nombre }} {{ servicio.perfil?.usuario?.apellidos }}</p>
      <p><strong>Modalidad:</strong> {{ servicio.modalidad }}</p>
      <p><strong>Precio:</strong> {{ servicio.precio }}</p>
      <p><strong>Duracion:</strong> {{ servicio.duracionMinutos }} min</p>
      <p><strong>Estado:</strong> {{ servicio.estado }}</p>
      <p><strong>Descripcion:</strong> {{ servicio.descripcion }}</p>
      <a routerLink="/servicios">Volver</a>
    </section>

    <p *ngIf="loading" class="status">Cargando detalle...</p>
    <p *ngIf="error" class="status error">{{ error }}</p>
  `,
})
export class ServicioDetallePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  servicio: Servicio | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getServicioById(id).subscribe({
      next: (data) => {
        this.servicio = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del servicio.';
        this.loading = false;
      },
    });
  }
}

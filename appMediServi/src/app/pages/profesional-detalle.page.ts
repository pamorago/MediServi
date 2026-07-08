import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Profesional } from '../core/models';

@Component({
  selector: 'app-profesional-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="card" *ngIf="profesional">
      <h2>Detalle profesional</h2>
      <p><strong>Nombre:</strong> {{ profesional.usuario.nombre }} {{ profesional.usuario.apellidos }}</p>
      <p><strong>Titulo:</strong> {{ profesional.tituloProfesional }}</p>
      <p><strong>Modalidad:</strong> {{ profesional.modalidad }}</p>
      <p><strong>Tarifa base:</strong> {{ profesional.tarifaBase }}</p>
      <p><strong>Disponibilidad:</strong> {{ profesional.disponible ? 'Disponible' : 'No disponible' }}</p>
      <p><strong>Descripcion:</strong> {{ profesional.descripcion }}</p>
      <p><strong>Ubicacion:</strong> {{ profesional.provincia }}, {{ profesional.canton }}, {{ profesional.distrito }}</p>
      <a routerLink="/profesionales">Volver</a>
    </section>

    <p *ngIf="loading" class="status">Cargando detalle...</p>
    <p *ngIf="error" class="status error">{{ error }}</p>
  `,
})
export class ProfesionalDetallePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  profesional: Profesional | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getProfesionalById(id).subscribe({
      next: (data) => {
        this.profesional = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del profesional.';
        this.loading = false;
      },
    });
  }
}

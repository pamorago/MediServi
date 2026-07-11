import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dash-layout">
      <section class="hero card">
        <div class="hero-copy">
          <div class="module-head">
            <span class="module-id">INICIO</span>
          </div>
          <p class="eyebrow">Red de atencion medica integral</p>
          <h2>Clinica MediServi: consulta preventiva, seguimiento y bienestar familiar</h2>
          <p>
            Ofrecemos consulta presencial y virtual con un modelo de atencion coordinada que combina
            valoracion clinica, educacion al paciente y continuidad terapeutica.
          </p>
          <div class="hero-links">
            <a routerLink="/categorias">Explorar servicios</a>
            <a routerLink="/citas" class="ghost">Ver agenda clinica</a>
          </div>
        </div>
        <aside class="hero-side">
          <h3>Panel principal</h3>
          <ul>
            <li><span>{{ totalCategorias }}</span> Programas de atención</li>
            <li><span>{{ totalEspecialidades }}</span> Especialidades activas</li>
            <li><span>{{ totalCitas }}</span> Citas registradas</li>
          </ul>
        </aside>
      </section>

      <section class="grid info-grid">
        <article class="card" *ngFor="let item of datosInstitucionales">
          <h3>{{ item.etiqueta }}</h3>
          <p>{{ item.valor }}</p>
        </article>
      </section>

      <section class="card">
        <h3>Compromiso asistencial</h3>
        <div class="grid commitment-grid">
          <article class="tile" *ngFor="let compromiso of compromisosClinicos">
            <h4>{{ compromiso.titulo }}</h4>
            <p>{{ compromiso.detalle }}</p>
          </article>
        </div>
      </section>

      <section class="card">
        <div class="section-head">
          <h3>Servicios mas consultados</h3>
          <a routerLink="/especialidades">Ver especialidades</a>
        </div>
        <div class="grid service-grid">
          <article class="service-item" *ngFor="let categoria of categoriasDestacadas">
            <h4>{{ categoria.nombre }}</h4>
            <p>{{ categoria.descripcion || 'Atencion clinica profesional con valoracion y plan de accion.' }}</p>
          </article>
        </div>
      </section>

      <p *ngIf="loading" class="status">Cargando panel clinico...</p>
      <p *ngIf="error" class="status error">{{ error }}</p>
    </div>
  `,
  styles: [
    `
      .dash-layout {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
        gap: 1rem;
        padding: 1.3rem;
        background:
          linear-gradient(130deg, rgba(90, 159, 143, 0.14), rgba(47, 122, 105, 0.1)),
          rgba(255, 255, 255, 0.88);
      }

      .hero-copy h2 {
        margin: 0;
        font-size: clamp(1.6rem, 4vw, 2.4rem);
        line-height: 1.1;
      }

      .hero-copy p {
        margin: 0.85rem 0 0;
      }

      .eyebrow {
        margin: 0 0 0.4rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
        color: #2f6e5f;
        font-size: 0.72rem;
      }

      .hero-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        margin-top: 1rem;
      }

      .hero-links a {
        text-decoration: none;
        border-radius: 12px;
        padding: 0.58rem 0.9rem;
        font-weight: 700;
      }

      .hero-links a:first-child {
        color: #fff;
        background: linear-gradient(145deg, #5a9f8f, #2f7a69);
      }

      .hero-links .ghost {
        border: 1px solid #bfd6ce;
        color: #2f6558;
        background: rgba(255, 255, 255, 0.72);
      }

      .hero-side {
        border: 1px solid #c6dcd4;
        border-radius: 14px;
        padding: 0.9rem;
        background: rgba(255, 255, 255, 0.7);
      }

      .hero-side h3 {
        margin: 0;
      }

      .hero-side ul {
        margin: 0.85rem 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.6rem;
      }

      .hero-side li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.7rem;
      }

      .hero-side span {
        font-family: var(--font-display);
        font-size: 1.35rem;
      }

      .info-grid {
        gap: 1.25rem;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .info-grid h3,
      .service-item h4 {
        margin: 0;
      }

      .info-grid p {
        margin: 0.45rem 0 0;
        color: var(--color-subtle);
      }

      .section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .section-head a {
        color: #2f6e5f;
        font-weight: 700;
      }

      .commitment-grid {
        margin-top: 1rem;
        gap: 1.25rem;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .tile {
        border: 1px dashed #c0d7cf;
        border-radius: 12px;
        padding: 0.9rem;
      }

      .tile h4 {
        margin: 0;
        font-family: var(--font-display);
        font-size: 1rem;
      }

      .tile p {
        margin: 0.45rem 0 0;
        color: var(--color-subtle);
      }

      .service-grid {
        margin-top: 0.9rem;
        gap: 1.25rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .service-item {
        border: 1px solid #c7dcd5;
        border-radius: 12px;
        padding: 0.95rem;
        background: rgba(255, 255, 255, 0.82);
      }

      .service-item p {
        margin: 0.45rem 0 0;
        color: var(--color-subtle);
      }

      @media (max-width: 900px) {
        .hero,
        .info-grid,
        .commitment-grid,
        .service-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  totalCategorias = 0;
  totalEspecialidades = 0;
  totalCitas = 0;
  categoriasDestacadas: Array<{ nombre: string; descripcion: string | null }> = [];
  loading = true;
  error = '';

  readonly compromisosClinicos = [
    {
      titulo: 'Atencion centrada en el paciente',
      detalle: 'Valoracion integral con planes de tratamiento personalizados y seguimiento continuo.',
    },
    {
      titulo: 'Equipo profesional verificado',
      detalle: 'Profesionales con credenciales validadas, experiencia clinica y enfoque etico.',
    },
    {
      titulo: 'Coordinacion digital de citas',
      detalle: 'Gestion de agenda, recordatorios y trazabilidad de atenciones desde una sola plataforma.',
    },
  ];

  readonly datosInstitucionales = [
    { etiqueta: 'Horario de consulta', valor: 'Lunes a sabado, 7:00 a.m. - 8:00 p.m.' },
    { etiqueta: 'Canal de telemedicina', valor: 'Disponible para control y seguimiento clinico' },
    { etiqueta: 'Cobertura principal', valor: 'Medicina general, pediatria, psicologia y nutricion' },
  ];

  ngOnInit(): void {
    forkJoin({
      categorias: this.api.getCategorias(),
      especialidades: this.api.getEspecialidades(),
      citas: this.api.getCitas(),
    }).subscribe({
      next: ({ categorias, especialidades, citas }) => {
        this.totalCategorias = categorias.length;
        this.totalEspecialidades = especialidades.length;
        this.totalCitas = citas.length;
        this.categoriasDestacadas = categorias.slice(0, 4).map((categoria) => ({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'No fue posible cargar el panel clinico. Verifica que el backend este ejecutandose en http://localhost:3000.';
        this.loading = false;
      },
    });
  }
}

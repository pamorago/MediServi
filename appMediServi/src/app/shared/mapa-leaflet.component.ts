import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { catchError, firstValueFrom, from, map, mergeMap, of, toArray } from 'rxjs';
import { GeocodingService, GeocodedPoint } from '../core/geocoding.service';
import { Profesional } from '../core/models';

@Component({
  selector: 'app-mapa-leaflet',
  standalone: true,
  template: `
    @if (profesionales.length === 0) {
      <div class="status-box loading">No hay profesionales para mostrar en el mapa</div>
    } @else {
      <div class="mapa-wrap">
        <div [id]="mapId" class="mapa-container"></div>
      </div>
    }
  `,
  styles: [`
    .mapa-wrap {
      margin-top: 1rem;
      border: 1px solid var(--color-outline);
      border-radius: 12px;
      overflow: hidden;
      background: #fff;
    }
    .mapa-container {
      width: 100%;
      min-height: 400px;
    }
    .status-box {
      border-radius: 10px;
      padding: .6rem .9rem;
      margin: .5rem 0;
      font-size: .88rem;
    }
    .status-box.loading {
      background: #f0f7ff;
      color: #1a5276;
      border: 1px solid #aed6f1;
    }

    :host ::ng-deep .marker-shell {
      background: transparent;
      border: 0;
    }
    :host ::ng-deep .marker-dot {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
      display: block;
    }
    :host ::ng-deep .marker-virtual {
      background: #2f7a69;
    }
    :host ::ng-deep .marker-presencial {
      background: #2463a6;
    }
    :host ::ng-deep .marker-mixta {
      background: #8c5a1f;
    }

    @media (max-width: 640px) {
      .mapa-container {
        min-height: 320px;
      }
    }
  `],
})
export class MapaLeafletComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() profesionales: Profesional[] = [];

  private readonly geocodingService = inject(GeocodingService);
  private readonly router = inject(Router);

  private map: L.Map | null = null;
  private readonly markersLayer = L.layerGroup();
  private renderToken = 0;
  readonly mapId = `mapa-leaflet-${Math.random().toString(36).slice(2, 9)}`;

  ngAfterViewInit(): void {
    this.scheduleRender();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['profesionales']) {
      this.scheduleRender();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private scheduleRender(): void {
    setTimeout(() => {
      this.renderMarkers().catch(() => {
        // Ignora fallos globales de render para no romper la UI.
      });
    });
  }

  private ensureMap(): void {
    if (this.map || this.profesionales.length === 0) {
      return;
    }

    const container = document.getElementById(this.mapId);
    if (!container) {
      return;
    }

    this.map = L.map(container, {
      center: [9.7489, -83.7534],
      zoom: 8,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private async renderMarkers(): Promise<void> {
    const currentToken = ++this.renderToken;

    if (this.profesionales.length === 0) {
      this.markersLayer.clearLayers();
      this.map?.remove();
      this.map = null;
      return;
    }

    this.ensureMap();
    if (!this.map) {
      return;
    }

    this.markersLayer.clearLayers();
    const bounds = L.latLngBounds([]);
    const geocoded = await firstValueFrom(
      from(this.profesionales).pipe(
        mergeMap(
          (profesional) =>
            this.geocodingService
              .geocodeCostaRica(profesional.provincia, profesional.canton, profesional.distrito)
              .pipe(
                map((point) => ({ profesional, point })),
                catchError(() => of({ profesional, point: null })),
              ),
          3,
        ),
        toArray(),
      ),
    );

    if (currentToken !== this.renderToken) {
      return;
    }

    for (const item of geocoded) {
      if (!item.point) {
        continue;
      }

      this.addMarkerForProfesional(item.profesional, item.point, bounds);
    }

    if (bounds.isValid()) {
      this.map.fitBounds(bounds.pad(0.2));
    }
  }

  private addMarkerForProfesional(
    profesional: Profesional,
    point: GeocodedPoint,
    bounds: L.LatLngBounds,
  ): void {
    const marker = L.marker([point.lat, point.lng], {
      icon: this.getModalidadIcon(profesional.modalidad),
    });
    const buttonId = `mapa-go-detail-${this.mapId}-${profesional.id}`;
    const nombreCompleto = `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`;

    marker.bindPopup(`
      <div style="min-width: 210px; font-family: system-ui, sans-serif;">
        <strong>${this.escapeHtml(nombreCompleto)}</strong><br />
        <span>${this.escapeHtml(profesional.tituloProfesional)}</span><br />
        <span>Modalidad: ${this.escapeHtml(profesional.modalidad)}</span><br /><br />
        <button id="${buttonId}" type="button" style="border:1px solid #b8d0c8;border-radius:8px;padding:6px 9px;background:#f3f9f6;cursor:pointer;">Ver detalle</button>
      </div>
    `);

    marker.on('popupopen', () => {
      const button = document.getElementById(buttonId);
      if (!button) {
        return;
      }

      button.onclick = () => {
        this.router.navigate(['/profesionales', profesional.id]);
      };
    });

    marker.addTo(this.markersLayer);
    bounds.extend([point.lat, point.lng]);
  }

  private getModalidadIcon(modalidad: Profesional['modalidad']): L.DivIcon {
    const modalidadClass =
      modalidad === 'VIRTUAL'
        ? 'marker-virtual'
        : modalidad === 'PRESENCIAL'
          ? 'marker-presencial'
          : 'marker-mixta';

    return L.divIcon({
      className: 'marker-shell',
      html: `<span class="marker-dot ${modalidadClass}"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8],
    });
  }

  private escapeHtml(text: string): string {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}

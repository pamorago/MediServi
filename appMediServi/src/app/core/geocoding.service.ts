import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface NominatimResult {
  lat: string;
  lon: string;
}

export interface GeocodedPoint {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, GeocodedPoint | null>();

  geocodeCostaRica(provincia: string, canton: string, distrito: string): Observable<GeocodedPoint | null> {
    const cacheKey = this.buildCacheKey(provincia, canton, distrito);
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return of(cached);
    }

    const query = `${distrito}, ${canton}, ${provincia}, Costa Rica`;
    const params = new HttpParams()
      .set('format', 'json')
      .set('q', query)
      .set('limit', '1');

    return this.http
      .get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
        params,
        headers: new HttpHeaders({
          'Accept-Language': 'es',
        }),
      })
      .pipe(
        map((results) => {
          if (!results.length) {
            return null;
          }

          const first = results[0];
          const lat = Number(first.lat);
          const lng = Number(first.lon);

          if (Number.isNaN(lat) || Number.isNaN(lng)) {
            return null;
          }

          return { lat, lng };
        }),
        tap((point) => this.cache.set(cacheKey, point)),
        catchError(() => {
          this.cache.set(cacheKey, null);
          return of(null);
        }),
      );
  }

  private buildCacheKey(provincia: string, canton: string, distrito: string): string {
    return [provincia, canton, distrito]
      .map((part) => part.trim().toLowerCase())
      .join('|');
  }
}

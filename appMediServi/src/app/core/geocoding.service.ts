import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, firstValueFrom, from, map, of } from 'rxjs';

interface NominatimResult {
  lat: string;
  lon: string;
}

export interface GeocodedPoint {
  lat: number;
  lng: number;
}

const MIN_INTERVAL_MS = 1100;

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, GeocodedPoint | null>();

  private queueTail: Promise<void> = Promise.resolve();

  geocodeCostaRica(provincia: string, canton: string, distrito: string): Observable<GeocodedPoint | null> {
    const cacheKey = this.buildCacheKey(provincia, canton, distrito);
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) {
      return of(cached);
    }

    return from(this.enqueue(() => this.fetchFromNominatim(provincia, canton, distrito, cacheKey)));
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queueTail.then(task, task);
    this.queueTail = result.then(
      () => this.wait(MIN_INTERVAL_MS),
      () => this.wait(MIN_INTERVAL_MS),
    );
    return result;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private fetchFromNominatim(
    provincia: string,
    canton: string,
    distrito: string,
    cacheKey: string,
  ): Promise<GeocodedPoint | null> {
    const query = `${distrito}, ${canton}, ${provincia}, Costa Rica`;
    const params = new HttpParams()
      .set('format', 'json')
      .set('q', query)
      .set('limit', '1');

    return firstValueFrom(
      this.http
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
          catchError(() => of(null)),
        ),
    ).then((point) => {
      this.cache.set(cacheKey, point);
      return point;
    });
  }

  private buildCacheKey(provincia: string, canton: string, distrito: string): string {
    return [provincia, canton, distrito]
      .map((part) => part.trim().toLowerCase())
      .join('|');
  }
}

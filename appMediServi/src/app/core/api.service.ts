import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Categoria,
  Especialidad,
  Cita,
  CitaPayload,
  Profesional,
  ProfesionalPayload,
  Servicio,
  ServicioPayload,
  Usuario,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  getUsuarios(params?: Record<string, string>): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`, { params });
  }

  setEstadoUsuario(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.baseUrl}/usuarios/${id}/estado`, { estado });
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  getCategoriasFiltradas(params?: Record<string, string>): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`, { params });
  }

  setEstadoCategoria(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.baseUrl}/categorias/${id}/estado`, { estado });
  }

  getEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`);
  }

  getEspecialidadesFiltradas(params?: Record<string, string>): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.baseUrl}/especialidades`, { params });
  }

  setEstadoEspecialidad(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<Especialidad> {
    return this.http.patch<Especialidad>(`${this.baseUrl}/especialidades/${id}/estado`, { estado });
  }

  getProfesionales(params?: Record<string, string>): Observable<Profesional[]> {
    return this.http.get<Profesional[]>(`${this.baseUrl}/profesionales`, { params });
  }

  getProfesionalById(id: number): Observable<Profesional> {
    return this.http.get<Profesional>(`${this.baseUrl}/profesionales/${id}`);
  }

  createProfesional(payload: ProfesionalPayload): Observable<Profesional> {
    return this.http.post<Profesional>(`${this.baseUrl}/profesionales`, payload);
  }

  updateProfesional(id: number, payload: ProfesionalPayload): Observable<Profesional> {
    return this.http.put<Profesional>(`${this.baseUrl}/profesionales/${id}`, payload);
  }

  setDisponibilidadProfesional(id: number, disponible: boolean): Observable<Profesional> {
    return this.http.patch<Profesional>(`${this.baseUrl}/profesionales/${id}/disponibilidad`, { disponible });
  }

  getServicios(params?: Record<string, string>): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.baseUrl}/servicios`, { params });
  }

  getServicioById(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.baseUrl}/servicios/${id}`);
  }

  createServicio(payload: ServicioPayload): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.baseUrl}/servicios`, payload);
  }

  updateServicio(id: number, payload: ServicioPayload): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.baseUrl}/servicios/${id}`, payload);
  }

  setEstadoServicio(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.baseUrl}/servicios/${id}/estado`, { estado });
  }

  uploadImagenPerfil(file: File, previousFileName?: string): Observable<{ fileName: string }> {
    const formData = new FormData();
    formData.append('imagen', file);
    if (previousFileName) {
      formData.append('previousFileName', previousFileName);
    }
    return this.http.post<{ fileName: string }>(`${this.baseUrl}/imagenes/upload`, formData);
  }

  getImageUrl(fileName: string): string {
    return `http://localhost:3000/images/${fileName}`;
  }

  getCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/citas`);
  }

  getCitasFiltradas(params?: Record<string, string>): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.baseUrl}/citas`, { params });
  }

  getCitaById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.baseUrl}/citas/${id}`);
  }

  createCita(payload: CitaPayload): Observable<Cita> {
    return this.http.post<Cita>(`${this.baseUrl}/citas`, payload);
  }
}

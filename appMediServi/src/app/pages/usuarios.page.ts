import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Usuario } from '../core/models';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="card">
      <div class="module-head">
        <span class="module-id">MOD-USU</span>
        <h2>Usuarios del sistema</h2>
      </div>
      <p>Administracion de usuarios con busqueda, filtro por rol y cambio logico de estado.</p>

      <div class="summary">
        <span>Total: {{ usuarios.length }}</span>
        <span>Activos: {{ contarPorEstado('ACTIVO') }}</span>
        <span>Inactivos: {{ contarPorEstado('INACTIVO') }}</span>
      </div>

      <div class="toolbar">
        <input [(ngModel)]="search" (keydown.enter)="aplicarFiltrosLocales()" placeholder="Buscar por nombre o correo" />
        <select [(ngModel)]="rol">
          <option value="">Todos los roles</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="PROFESIONAL">Profesional</option>
          <option value="CLIENTE">Cliente</option>
        </select>
        <select [(ngModel)]="estado">
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <button class="primary" (click)="aplicarFiltrosLocales()">Aplicar filtros</button>
        <button type="button" (click)="limpiarFiltros()">Limpiar</button>
      </div>

      <p *ngIf="loading" class="status">Cargando usuarios...</p>
      <p *ngIf="error" class="status error">{{ error }}</p>

      <div class="table-wrap" *ngIf="!loading && !error">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let usuario of usuarios">
              <td><span class="record-id">USR-{{ usuario.id }}</span></td>
              <td>{{ usuario.nombre }} {{ usuario.apellidos }}</td>
              <td>{{ usuario.email }}</td>
              <td><span class="pill role">{{ usuario.rol }}</span></td>
              <td><span class="pill" [class.off]="usuario.estado === 'INACTIVO'">{{ usuario.estado }}</span></td>
              <td class="actions">
                <button (click)="toggleEstado(usuario)">
                  {{ usuario.estado === 'ACTIVO' ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      .summary {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 0.65rem;
      }

      .summary span {
        border: 1px solid var(--color-outline);
        border-radius: 999px;
        background: var(--color-soft);
        font-size: 0.82rem;
        padding: 0.2rem 0.55rem;
      }

      .pill {
        display: inline-block;
        border-radius: 999px;
        padding: 0.2rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 700;
        color: #2d5b4f;
        background: #e3f3ee;
      }

      .pill.off {
        color: #7a1c1c;
        background: #fbe6e6;
      }

      .pill.role {
        color: #234f45;
        background: #edf7f3;
      }
    `,
  ],
})
export class UsuariosPageComponent implements OnInit {
  private readonly api = inject(ApiService);

  private todosUsuarios: Usuario[] = [];
  usuarios: Usuario[] = [];
  loading = false;
  error = '';
  search = '';
  rol = '';
  estado = '';

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';

    this.api.getUsuarios().subscribe({
      next: (data) => {
        this.todosUsuarios = data;
        this.aplicarFiltrosLocales();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.loading = false;
      },
    });
  }

  aplicarFiltrosLocales(): void {
    const search = this.search.trim().toLowerCase();
    this.usuarios = this.todosUsuarios.filter((usuario) => {
      const matchSearch =
        !search ||
        `${usuario.nombre} ${usuario.apellidos}`.toLowerCase().includes(search) ||
        usuario.email.toLowerCase().includes(search);
      const matchRol = !this.rol || usuario.rol === this.rol;
      const matchEstado = !this.estado || usuario.estado === this.estado;
      return matchSearch && matchRol && matchEstado;
    });
  }

  limpiarFiltros(): void {
    this.search = '';
    this.rol = '';
    this.estado = '';
    this.aplicarFiltrosLocales();
  }

  contarPorEstado(estado: 'ACTIVO' | 'INACTIVO'): number {
    return this.usuarios.filter((u) => u.estado === estado).length;
  }

  toggleEstado(usuario: Usuario): void {
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!confirm(`Confirma cambiar el estado a ${nuevoEstado}?`)) {
      return;
    }

    this.api.setEstadoUsuario(usuario.id, nuevoEstado).subscribe({
      next: () => this.cargarUsuarios(),
      error: () => {
        this.error = 'No fue posible actualizar el estado del usuario.';
      },
    });
  }
}

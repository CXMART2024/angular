import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SolicitudService } from '../solicitud/solicitud.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://backendbecas.azurewebsites.net';
  //https://backendbecas.azurewebsites.net
  //https://backendbecas.azurewebsites.net
  // https://backendbecas.azurewebsites.net <-----Esto estaba antes
  constructor(
    private http: HttpClient,
    private router: Router,
    private solicitudService: SolicitudService,
  ) {}

  login(dni: string, clave: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { dni, clave }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('tipo', response.tipo);

          if (response.permisos) {
            localStorage.setItem('permisos', JSON.stringify(response.permisos));
          }
        } else {
          console.error('Token not found in the response');
        }
      }),
    );
  }

  tienePermiso(permiso: string): boolean {
    const permisos = JSON.parse(localStorage.getItem('permisos') || '[]');
    return permisos.includes(permiso);
  }

  esAdmin(): boolean {
    return localStorage.getItem('tipo') === 'admin';
  }

  actualizarClave(
    dni: string,
    antiguaClave: string,
    nuevaClave: string,
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-clave`, {
      dni,
      antiguaClave,
      nuevaClave,
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('tipo');
    localStorage.removeItem('permisos');
    this.solicitudService.clearSolicitudData();
    this.router.navigate(['/']);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { SolicitudService } from '../solicitud/solicitud.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://backendbecas.azurewebsites.net';

  constructor(
    private http: HttpClient,
    private router: Router,
    private solicitudService: SolicitudService
  ) { }

  login(dni: string, clave: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { dni, clave }).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);

          this.http.get(`${this.apiUrl}/solicitudes/dni/${dni}`, {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${response.token}`
            })
          }).subscribe(solicitudData => {
            this.solicitudService.setSolicitudData(solicitudData);
          })
        } else {
          console.error('Token not found in the response');
        }
      })
    )
  }

  registrar(dni: string, clave: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, { dni, clave })
  }

  actualizarClave(dni: string, antiguaClave: string, nuevaClave: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-clave`, { dni, antiguaClave, nuevaClave })
  }


  logout() {
    localStorage.removeItem('token');
    this.solicitudService.clearSolicitudData();
    this.router.navigate(['/'])
  }
}

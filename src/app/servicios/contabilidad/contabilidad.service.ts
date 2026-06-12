import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Contabilidad } from '../../modelos/contabilidad';

@Injectable({
  providedIn: 'root',
})
export class ContabilidadService {
  private apiUrl = 'https://backendbecas.azurewebsites.net/contabilidad';

  //http://localhost:3000
  //https://backendbecas.azurewebsites.net/contabilidad

  constructor(private http: HttpClient) {}

  getPagosConEstadoContabilidad() {
    return this.http.get<Contabilidad[]>(`${this.apiUrl}`);
  }

  getPagoPorId(id_registro: number) {
    return this.http.get<Contabilidad>(`${this.apiUrl}/${id_registro}`);
  }

  getPagoPorCiclo(id_registroCiclo: number) {
    return this.http.get<Contabilidad[]>(
      `${this.apiUrl}/ciclo/${id_registroCiclo}`,
    );
  }

  updatePagoCont(contabilidad: Contabilidad) {
    return this.http.put<Contabilidad>(
      `${this.apiUrl}/${contabilidad.id}`,
      contabilidad,
    );
  }
}

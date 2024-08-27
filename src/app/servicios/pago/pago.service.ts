import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pago } from '../../modelos/pago';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

  private apiUrl = 'http://localhost:3000/pago';


  constructor(private http: HttpClient) { }

  //Retornar pago
  getPago(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  //Retornar pagos por ciclo
  getPagoByCiclo(id_registroCiclo: number) {
    return this.http.get(`${this.apiUrl}/ciclo/${id_registroCiclo}`);
  }

  //Crear pago
  createPago(pago: Pago) {
    return this.http.post(`${this.apiUrl}`,pago);
  }
  
  //Actualizar pago
  updatePago(pago: Pago) {
    return this.http.put(`${this.apiUrl}/${pago.id}`,pago);
  }

  //Eliminar pago
  deletePago(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

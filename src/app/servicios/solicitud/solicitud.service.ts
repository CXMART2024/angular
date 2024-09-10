import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {

  private solicitudData: any;
  private apiUrl = 'https://backendbecas.azurewebsites.net/solicitudes';
  private solicitudDataSubject: BehaviorSubject<any>;

  constructor(private http: HttpClient) {
    const storedSolicitudData = localStorage.getItem('solicitudData');
    this.solicitudDataSubject = new BehaviorSubject<any>(storedSolicitudData ? JSON.parse(storedSolicitudData) : null);

  }

  //setear data solicitud después del login
  setSolicitudData(data: any) {
    //this.solicitudData = data;
    this.solicitudDataSubject.next(data);
    localStorage.setItem('solicitudData', JSON.stringify(data));
    
  }


  //obtener datos solicitud
  getSolicitudData(): Observable<any> {
   return this.solicitudDataSubject.asObservable();
  }


  //limpiar data solicitud
  clearSolicitudData() {
    this.solicitudData = null;
    localStorage.removeItem('solicitudData');
  }

  //actualizar datos solicitud
  updateSolicitud(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${data.id}`, data);
  };

  getSolicitudByDni(dni: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/dni/${dni}`)
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ciclo } from '../../modelos/ciclo';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CicloService {

  private apiUrl = 'https://backendbecas.azurewebsites.net/registro/ciclo';
  private selectedCiclo: Ciclo | null = null;
  private readonly STORAGE_KEY = 'selectedCiclo'


  constructor(
    private http: HttpClient,
    private datePipe: DatePipe,
  ) {
  }

  //Retornar ciclo

  getCiclo(id: number): Observable<Ciclo[]> {
    return this.http.get<Ciclo[]>(`${this.apiUrl}/${id}`);
  }
 

  //Retornar ciclo por solicitud
  getCiclosBySolicitud(id_solicitud: number) {
    return this.http.get<Ciclo[]>(`${this.apiUrl}/solicitud/${id_solicitud}`);
  }

  //Crear ciclo
  createCiclo(ciclo: Ciclo) {
    return this.http.post(`${this.apiUrl}`, ciclo);
  }

  //Actualizar ciclo

  updateCiclo(ciclo: Ciclo) {
    return this.http.put<Ciclo>(`${this.apiUrl}/${ciclo.id}`, ciclo);
  }
  /*
   updateCiclo(ciclo: Ciclo): Observable<Ciclo> {
     return this.http.put<Ciclo>(`${this.apiUrl}/${ciclo.id}`, ciclo);
   }*/

  //Eliminar ciclo
  deleteCiclo(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


  //setear ciclo seleccionado
  setSelectedCiclo(ciclo: Ciclo): void {
    this.selectedCiclo = ciclo;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ciclo));
  }


  //obtener ciclo seleccionado
  getSelectedCiclo(): Ciclo | null {
    if (this.selectedCiclo) return this.selectedCiclo;

    const cicloData = localStorage.getItem(this.STORAGE_KEY);
    if (cicloData) {
      this.selectedCiclo = JSON.parse(cicloData);
    }

    return this.selectedCiclo;
  }

  //Limpiar ciclo seleccionado
  clearSelectedCiclo(): void {
    this.selectedCiclo = null;

    localStorage.removeItem(this.STORAGE_KEY);
  }

  //Formatear fecha
 
  formatDate(date: Date): string {
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return this.datePipe.transform(utcDate, 'yyyy-MM-dd') ?? '';
  }
}

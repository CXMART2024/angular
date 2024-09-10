import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { CursoMalla } from '../../modelos/curso-malla';
import { Observable } from 'rxjs';
import { RelacionMalla } from '../../modelos/relacion-malla';

@Injectable({
  providedIn: 'root',
})
export class MallaCurricularService {

  private cursoMallaArray: CursoMalla[] = [];

  private apiUrl = 'https://backendbecas.azurewebsites.net/malla';

  constructor(private http: HttpClient) { }

  //Funciones CICLOS de malla curricular
  // Retornar ciclos de malla por solicitud


  getCiclosMallaBySolicitud(id_solicitud: number) {
    return this.http.get<CicloMalla[]>(`${this.apiUrl}/ciclos/solicitud/${id_solicitud}`);
  }

  //Retornar ciclo de malla
  /*getCicloMalla(id: number) {
    return this.http.get(`${this.apiUrl}/ciclo/${id}`);
  }*/
  getCicloMalla(id: number): Observable<CicloMalla[]> {
    return this.http.get<CicloMalla[]>(`${this.apiUrl}/ciclo/${id}`);
  }


  //Crear ciclo malla
  createCicloMalla(ciclo: CicloMalla) {
    return this.http.post<CicloMalla>(`${this.apiUrl}/ciclo`, ciclo);
  }


  //Actualiza ciclo malla
  updateCicloMalla(ciclo: CicloMalla) {
    return this.http.put(`${this.apiUrl}/ciclo/${ciclo.id}`, ciclo);
  }

  //Eliminar ciclo malla
  deleteCicloMalla(ciclo: CicloMalla) {
    return this.http.delete(`${this.apiUrl}/ciclo/${ciclo.id}`);
  }

  //Funciones CURSOS de malla curricular

  // Retornar curso de malla
  getCursoMalla(id: number) {
    return this.http.get(`${this.apiUrl}/curso/${id}`);
  }


  // Retornar cursos de malla por ciclo
  /* getCursoMallaByCiclo(id_ciclo: number) {
    return this.http.get(`${this.apiUrl}/cursos/ciclo/${id_ciclo}`);
  }*/
  getCursoMallaByCiclo(id_ciclo: number): Observable<CursoMalla[]> {
    return this.http.get<CursoMalla[]>(`${this.apiUrl}/cursos/ciclo/${id_ciclo}`);
  }

  // Crear cursos de malla
  createCursoMalla(curso: CursoMalla) {
    return this.http.post(`${this.apiUrl}/curso`, curso);
  }

  // Actualizar cursos de malla
  updateCursoMalla(curso: CursoMalla) {
    return this.http.put(`${this.apiUrl}/curso/${curso.id}`, curso);
  }

  // Eliminar cursos de malla
  deleteCursoMalla(id: number) {
    return this.http.delete(`${this.apiUrl}/curso/${id}`);
  }

  // Eliminar cursos de malla por ciclo
  deleteCursoMallaByCiclo(id_ciclo: number) {
    return this.http.delete(`${this.apiUrl}/cursos/ciclo/${id_ciclo}`);
  }

  //Temporal almacenamiento

  // Agregar Record al Array
  addCursoMallaTemporal(cursoMalla: CursoMalla) {
    this.cursoMallaArray.push(cursoMalla);
  }

  // Obtener todo de mi Array
  getCursoMallasTemporal(): CursoMalla[] {
    return this.cursoMallaArray;
  }


  // Encontrar mi instancia por index
  getCursoMallaTemporal(index: number): CursoMalla | undefined {
    return this.cursoMallaArray[index];
  }

  // Actualizar mi instancia en el array
  updateCursoMallaTemporal(index: number, updatedCursoMalla: CursoMalla) {
    if (index >= 0 && index < this.cursoMallaArray.length) {
      this.cursoMallaArray[index] = updatedCursoMalla;
    }
  }


  // Limpiar todo mi array
  clearCursoMallasTemporal() {
    this.cursoMallaArray = [];
  }

  //Eliminar instancia por index 
  deleteCursoMallaTemporal(index: number) {
    if (index >= 0 && index < this.cursoMallaArray.length) {
      this.cursoMallaArray.splice(index, 1);
    }
  }



}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Curso } from '../../modelos/curso';

@Injectable({
  providedIn: 'root'
})
export class CursoService {

  private apiUrl = 'https://backendbecas.azurewebsites.net/registro/curso';

  constructor(private http: HttpClient) { 
  }

  //Retornar curso
  getCurso(id: number) {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  //Retornar curso por ciclo
  getCursoByCiclo(id_registro_ciclo: number) {
    return this.http.get<Curso[]>(`${this.apiUrl}/ciclo/${id_registro_ciclo}`);
  }

  //Crear curso 
  createCurso(curso: Curso) {
    return this.http.post(`${this.apiUrl}`, curso);
  }

  //Actualizar curso 
  updateCurso(curso: Curso) {
    return this.http.put(`${this.apiUrl}/${curso.id}`, curso);
  }

  //Eliminar curso 
  deleteCurso(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  //Eliminar cursos por ciclo
  deleteCursoByCiclo(id_registro_ciclo: number){
    return this.http.delete(`${this.apiUrl}/ciclo/${id_registro_ciclo}`)
  }

  getNumCursos(cursos: Array<Curso>): number {
    return cursos.length
  }

  getTotalCreditos(cursos: Array<Curso>): number {
    return cursos.reduce((total, curso) => total + curso.creditos,0);
  }
}


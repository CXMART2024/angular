import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { firstValueFrom, forkJoin, map, Observable } from 'rxjs';
import { format } from 'date-fns';
import moment from 'moment';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { CursoMalla } from '../../modelos/curso-malla';
import { RelacionMalla } from '../../modelos/relacion-malla';
import { Ciclo } from '../../modelos/ciclo';
import { Router } from '@angular/router';


@Component({
  selector: 'app-informacion-beca',
  templateUrl: './informacion-beca.component.html',
  styleUrl: './informacion-beca.component.css'
})
export class InformacionBecaComponent implements OnInit {
  solicitud: any;
  ciclosMallaLista?: CicloMalla[];
  cursoMallaLista?: CursoMalla[];
  cicloCursoRelacion?: RelacionMalla[];
  selectedCicloId?: number;
  url_foto_estudiante = new FormData();
  url_doc_contrato = new FormData();
  id_malla_curricular = new FormData();

  nombre_completo: string = '';
  dni: string = '';
  institucion_nombre: string = '';
  fecha_inicio: string = '';
  fecha_fin_estimada: string = '';

  constructor(
    private solicitudService: SolicitudService,
    private http: HttpClient,
    private mallaCurricularService: MallaCurricularService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if (this.solicitud) {
        this.nombre_completo = this.solicitud.nombre_completo;
        this.dni = this.solicitud.dni;
        this.institucion_nombre = this.solicitud.institucion_nombre;
        this.fecha_inicio = this.formatDateForInput(this.solicitud.fecha_inicio);
        this.fecha_fin_estimada = this.formatDateForInput(this.solicitud.fecha_fin_estimada);
        this.getMallaCiclos();
        this.cdr.detectChanges();
      } else {
        console.error('Solicitud data is not available');
      }
    });

  }

  onFileChange_url_foto_estudiante(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url_foto_estudiante.append('file', file, file.name);
    }
  }

  onFileChange_id_malla_curricular(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.id_malla_curricular.append('file', file, file.name);
    }
  }

  onFileChange_contratoBecario(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url_doc_contrato.append('file', file, file.name);
    }
  }

  updateInformacionBecario() {

    const cargaArchivos: Observable<any>[] = [];

    if (this.url_foto_estudiante.has('file')) {
      cargaArchivos.push(this.http.post('http://localhost:3000/upload', this.url_foto_estudiante));
    }

    if (this.id_malla_curricular.has('file')) {
      cargaArchivos.push(this.http.post('http://localhost:3000/upload', this.id_malla_curricular));
    }

    if (this.url_doc_contrato.has('file')) {
      cargaArchivos.push(this.http.post('http://localhost:3000/upload', this.url_doc_contrato));
    }

    if (cargaArchivos.length > 0) {
      forkJoin(cargaArchivos).subscribe({
        next: (responses: any[]) => {
          if (responses.length > 0) {
            if (this.url_foto_estudiante.has('file')) {
              this.solicitud.url_foto_estudiante = responses[0].url;
            }
            if (this.id_malla_curricular.has('file')) {
              this.solicitud.id_malla_curricular = responses[1].url;
            }
            if (this.url_doc_contrato.has('file')) {
              this.solicitud.url_doc_contrato = responses[2].url;
            }
          }

          this.solicitud.fecha_inicio = this.fecha_inicio;
          this.solicitud.fecha_fin_estimada = this.fecha_fin_estimada;

          this.solicitudService.updateSolicitud(this.solicitud).subscribe({
            next: (response: any) => {
              console.log('Se actualizó correctamente', response);
              this.cdr.detectChanges();
            },
            error: (error: any) => {
              console.error('Error al actualizar información', error);
            }
          });
        },
        error: (error) => {
          console.error('Error subiendo archivos', error);
        }
      });
    } else {
      this.solicitud.fecha_inicio = this.fecha_inicio;
      this.solicitud.fecha_fin_estimada = this.fecha_fin_estimada;

      this.solicitudService.updateSolicitud(this.solicitud).subscribe({
        next: (response: any) => {
          console.log('Se actualizó correctamente', response);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error al actualizar información', error);
        }
      });
    }
  }


  submitForm() {
    if (this.fecha_inicio && this.fecha_fin_estimada) {
      this.updateInformacionBecario();
    } else {
      console.log('Formulario invalido');
    }
  }

  formatDateForInput(dateString: string): string {
    return moment.utc(dateString).format('YYYY-MM-DD');
  }

  getMallaCiclos() {
    if (this.solicitud && this.solicitud.id) {
      this.mallaCurricularService.getCiclosMallaBySolicitud(this.solicitud.id).subscribe({
        next: (ciclos: CicloMalla[]) => {
          console.log('Ciclos received:', ciclos);
          this.ciclosMallaLista = ciclos;
          this.fetchCursosForCiclos(ciclos);
        },
        error: (error) => {
          console.error('Error fetching ciclos', error);
        }
      });
    } else {
      console.error('id_solicitud is undefined or not available');
    }
  }

  fetchCursosForCiclos(ciclos: CicloMalla[]) {
    if (ciclos.length === 0) {
      return;
    }

    const cursoRequests = ciclos.map(ciclo =>
      this.mallaCurricularService.getCursoMallaByCiclo(ciclo.id).pipe(
        map(cursos => ({ ciclo, cursos }))
      )
    );

    forkJoin(cursoRequests).subscribe({
      next: (cicloCursoPairs: RelacionMalla[]) => {
        this.cicloCursoRelacion = cicloCursoPairs;
        console.log('Ciclos and Cursos recibidos:', cicloCursoPairs);
      },
      error: (error) => {
        console.error('Error fetching cursos', error);
      }
    });
  }

  deleteCicloAll(ciclo: CicloMalla): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el ciclo ${ciclo.nombre}?`)) {
      this.mallaCurricularService.deleteCursoMallaByCiclo(ciclo.id).subscribe({
        next: () => {
          this.mallaCurricularService.deleteCicloMalla(ciclo).subscribe({
            next: (response) => {
              console.log('CicloMalla deleted successfully:', response);
              this.getMallaCiclos();
            },
            error: (err) => {
              console.error('Error deleting CicloMalla:', err);
              alert('Error al eliminar Ciclo');
            }
          });
        },
        error: (err) => {
          console.error('Error deleting CursoMalla by ciclo:', err);
          alert('Error al eliminar el curso del ciclo');
        }
      });
    }
  }

  selectCiclo(id: number): void {
    this.selectedCicloId = id;
    console.log('Selected Ciclo ID:', id);
    this.navigateToEditMallaCursos();
  }

  navigateToEditMallaCursos(): void {
    if (this.selectedCicloId !== null) {
      this.router.navigate(['/informacion', this.selectedCicloId]);
    } else {
      console.error('No Ciclo ID selected');
    }
  }
}


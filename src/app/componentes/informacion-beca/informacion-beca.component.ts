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
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-informacion-beca',
  templateUrl: './informacion-beca.component.html',
  styleUrl: './informacion-beca.component.css'
})
export class InformacionBecaComponent implements OnInit {
  solicitud: any;
  isChecked: boolean = false;
  ciclosMallaLista?: CicloMalla[];
  cursoMallaLista?: CursoMalla[];
  cicloCursoRelacion?: RelacionMalla[];
  selectedCicloId?: number;
  url_foto_estudiante = new FormData();
  url_doc_contrato = new FormData();
  id_malla_curricular = new FormData();

  editMallaCurricular: boolean = true;

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
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if (this.solicitud) {
        this.editMallaCurricular = (this.solicitud.MallaEstado == 'No Cargado' || this.solicitud.MallaEstado == 'Observado');
        this.nombre_completo = this.solicitud.nombre_completo;
        this.dni = this.solicitud.dni;
        this.institucion_nombre = this.solicitud.institucion_nombre;
        this.fecha_inicio = this.formatDateForInput(this.solicitud.fecha_inicio);
        this.fecha_fin_estimada = this.formatDateForInput(this.solicitud.fecha_fin_estimada);
        this.getMallaCiclos();

        if (this.solicitud.contratoBecario == '0') {
          this.showModal();
        }
      } else {
        console.error('Solicitud data is not available');
      }

    });
    this.cdr.detectChanges();

  }


  showModal() {
    const modalElement = document.getElementById('contrato_becario');
    if (modalElement && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();
    }
  }

  // Method to update checkbox status
  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isChecked = input.checked;
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
      cargaArchivos.push(this.http.post('https://backendbecas.azurewebsites.net/upload', this.url_foto_estudiante));
    }

    if (this.id_malla_curricular.has('file')) {
      cargaArchivos.push(this.http.post('https://backendbecas.azurewebsites.net/upload', this.id_malla_curricular));
    }

    if (this.url_doc_contrato.has('file')) {
      cargaArchivos.push(this.http.post('https://backendbecas.azurewebsites.net/upload', this.url_doc_contrato));
    }

    this.solicitud.MallaEstado = (this.editMallaCurricular) ? 'Por Revisar' : this.solicitud.MallaEstado;

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

              this.toastr.success(`Se actualizó correctamente.`);
              this.cdr.detectChanges();
            },
            error: (error: any) => {
              console.error('Error al actualizar información', error);
              this.toastr.error(`Error al actualizar información. Por favor, refresca la página y vuelve a intentarlo.`);
            }
          });
        },
        error: (error) => {
          console.error('Error subiendo archivos', error);
          this.toastr.error(`Error subiendo archivos. Por favor, refresca la página y vuelve a intentarlo.`);

        }
      });
    } else {
      this.solicitud.fecha_inicio = this.fecha_inicio;
      this.solicitud.fecha_fin_estimada = this.fecha_fin_estimada;

      this.solicitudService.updateSolicitud(this.solicitud).subscribe({
        next: (response: any) => {

          this.toastr.success(`Se actualizó correctamente.`);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error al actualizar información', error);
          this.toastr.error(`Error al actualizar información. Por favor, refresca la página y vuelve a intentarlo.`);
        }
      });
    }
  }


  submitForm() {
    if (this.fecha_inicio && this.fecha_fin_estimada) {
      this.updateInformacionBecario();
    } else {

      this.toastr.error(`Por favor, selecciona una fecha de inicio y una fecha estimada.`);
    }
  }

  formatDateForInput(dateString: string): string {
    return moment.utc(dateString).format('YYYY-MM-DD');
  }

  getMallaCiclos() {
    if (this.solicitud && this.solicitud.id) {
      this.mallaCurricularService.getCiclosMallaBySolicitud(this.solicitud.id).subscribe({
        next: (ciclos: CicloMalla[]) => {
          //console.log('Ciclos received:', ciclos);
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
        //console.log('Ciclos and Cursos recibidos:', cicloCursoPairs);
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

    this.navigateToEditMallaCursos();
  }

  navigateToEditMallaCursos(): void {
    if (this.selectedCicloId !== null) {
      this.router.navigate(['/informacion', this.selectedCicloId]);
    } else {
      console.error('No Ciclo ID selected');
    }
  }

  clearData() {
    return this.mallaCurricularService.clearCursoMallasTemporal();
  }


  aceptarContrato(solicitudData: any) {
    solicitudData.contratoBecario = '1';
    console.log(solicitudData);
    this.solicitudService.updateSolicitud(solicitudData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.cdr.detectChanges();
      }
    });
  }


}


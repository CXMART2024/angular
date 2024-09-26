import { Component, OnInit } from '@angular/core';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { CursoMalla } from '../../modelos/curso-malla';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { FormsModule } from '@angular/forms';
import { Ciclo } from '../../modelos/ciclo';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { CursoService } from '../../servicios/curso/curso.service';
import { Curso } from '../../modelos/curso';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

@Component({
  selector: 'app-nuevo-ciclo-academico',
  templateUrl: './nuevo-ciclo-academico.component.html',
  styleUrl: './nuevo-ciclo-academico.component.css',
})
export class NuevoCicloAcademicoComponent implements OnInit {
  solicitud: any;
  selectedCicloMallaId: number = 0;
  listCicloMalla: Array<CicloMalla> = [];
  listCurso: Array<CursoMalla> = [];
  listCursoPopUp: Array<CursoMalla> = [];
  cursoSeleccionadoPopUp: CursoMalla = new CursoMalla(0, '', 0, 0, '');
  fechaFinInvalid: boolean = false;
  ciclo: Ciclo = new Ciclo(
    0,
    new Date(),
    new Date(),
    '',
    0,
    0,
    '',
    0,
    '',
    '',
    ''
  );
  url = new FormData();

  constructor(
    private mallaService: MallaCurricularService,
    private solicitudService: SolicitudService,
    private cicloService: CicloService,
    private cursoService: CursoService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe((data) => {
      this.solicitud = data;
      if (this.solicitud) {
        this.mallaService
          .getCiclosMallaBySolicitud(this.solicitud.id)
          .subscribe({
            next: (listCiclo: Array<CicloMalla>) => {
              this.listCicloMalla = listCiclo;
            },
            error: (error) => {
              console.error('Error obteniendo ciclos:', error);
            },
          });
      }
    });
  }

  obtenerCursosDeCicloMalla(cicloMalla: any) {
    this.selectedCicloMallaId = cicloMalla.target.value;
    this.mallaService.getCursoMallaByCiclo(cicloMalla.target.value).subscribe({
      next: (listCurso: Array<CursoMalla>) => {
        this.listCurso = listCurso;
      },
      error: (error) => {
        console.error('Error obteniendo cursos:', error);
      },
    });
  }

  quitarCursoDeLista(cursoAEliminar: CursoMalla) {
    this.listCurso = this.listCurso.filter(
      (curso) => curso.id !== cursoAEliminar.id
    );
  }

  onAgregarCursoCicloChange(cicloSeleccionado: any): void {
    this.mallaService
      .getCursoMallaByCiclo(cicloSeleccionado.target.value)
      .subscribe({
        next: (listCurso: Array<CursoMalla>) => {
          this.listCursoPopUp = listCurso;
        },
        error: (error) => {
          console.error('Error obteniendo cursos:', error);
        },
      });
  }

  onAgregarCursoChange(cursoSeleccionado: any) {
    const curso = this.listCursoPopUp.find(
      (curso) => curso.id == cursoSeleccionado.target.value
    );
    if (curso) {
      this.cursoSeleccionadoPopUp = curso;
    }
  }

  agregarCurso(): void {
    if (this.cursoSeleccionadoPopUp) {
      this.listCurso.push(this.cursoSeleccionadoPopUp);
      this.cursoSeleccionadoPopUp = new CursoMalla(0, '', 0, 0, '');
    }
  }

  contarCursos(): number {
    return this.listCurso.length;
  }

  sumarCredito(): number {
    return this.listCurso.reduce((total, curso) => total + curso.creditos, 0);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url.append('file', file, file.name);
    }
  }

  guardarCicloAcademico(): void {
    const cargaArchivos = [
      this.http.post('https://backendbecas.azurewebsites.net/upload', this.url),
    ];

    forkJoin(cargaArchivos).subscribe({
      next: (response: any[]) => {
        this.ciclo.fecha_inicio = moment(this.ciclo.fecha_inicio).startOf('day').toDate();
        this.ciclo.fecha_fin = moment(this.ciclo.fecha_fin).startOf('day').toDate();

        this.ciclo.id_ciclo = this.selectedCicloMallaId ;
        this.ciclo.id_solicitud = this.solicitud.id;
        this.ciclo.id_doc_matricula = response[0].url;
        this.ciclo.estado = 'En Proceso';
        this.ciclo.creditos = this.sumarCredito();
        this.cicloService.createCiclo(this.ciclo).subscribe({
          next: (response: any) => {
            for (let curso of this.listCurso) {
              const newCurso = new Curso(
                0,
                curso.id,
                curso.tipo,
                0,
                response.id,
                this.solicitud.id,
                curso.creditos,
                curso.Nombre
              );
              this.guardarCurso(newCurso);
              this.toastr.success(`Ciclo registrado correctamente`)
              this.router.navigate(['informacion-view']);
            }
          },
          error: (err) => {
            this.toastr.error(`Error al guardar ciclo`)
          },
        });
      },
    });
  }

  guardarCurso(curso: Curso): void {
    this.cursoService.createCurso(curso).subscribe({
      next: () => {
        
      }
    });
  }

  isFileSelected(): boolean {
    return this.url.has('file');
  }
  validateDates(): void {
    const fechaInicio = new Date(this.ciclo.fecha_inicio);
    const fechaFin = new Date(this.ciclo.fecha_fin);
    this.fechaFinInvalid = fechaFin < fechaInicio; 
  }
}


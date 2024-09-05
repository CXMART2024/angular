import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { Ciclo } from '../../modelos/ciclo';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Curso } from '../../modelos/curso';
import { CursoService } from '../../servicios/curso/curso.service';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { CursoMalla } from '../../modelos/curso-malla';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-ciclo-academico',
  templateUrl: './editar-ciclo-academico.component.html',
  styleUrl: './editar-ciclo-academico.component.css',
})
export class EditarCicloAcademicoComponent implements OnInit {
  solicitud: any;
  selectedCicloMallaId: number = 0;
  selectedCiclo: Ciclo | null = null;
  listCursos: Array<Curso> = [];
  listCursoPopUp: Array<CursoMalla> = [];
  cursoSeleccionadoPopUp: CursoMalla = new CursoMalla(0, '', 0, 0, '');
  listCicloMalla: Array<CicloMalla> = [];
  fechaInicioStr: string = '';
  fechaFinStr: string = '';
  url = new FormData();

  constructor(
    private solicitudService: SolicitudService,
    private cicloService: CicloService,
    private cursoService: CursoService,
    private mallaService: MallaCurricularService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe((data) => {
      this.solicitud = data;
      if (this.solicitud) {
        this.selectedCiclo = this.cicloService.getSelectedCiclo();
        if (this.selectedCiclo) {
          //Asignar fecha en variables temporales tipo string para mostrarlas por default en el form
          this.fechaInicioStr = this.cicloService.formatDate(
            this.selectedCiclo.fecha_fin
          );
          this.fechaFinStr = this.cicloService.formatDate(
            this.selectedCiclo.fecha_fin
          );
          //Obtener cursos del ciclo

          this.cursoService.getCursoByCiclo(this.selectedCiclo.id).subscribe({
            next: (listCurso: Array<Curso>) => {
              this.listCursos = listCurso;
              this.cdr.detectChanges();
            },
          });
          //Obtener ciclos malla
          this.mallaService
            .getCiclosMallaBySolicitud(this.solicitud.id)
            .subscribe({
              next: (listCiclo: Array<CicloMalla>) => {
                this.listCicloMalla = listCiclo;
              },
            });
        }
      }
    });
  }

  contarCursos(): number {
    return this.listCursos.length;
  }

  sumarCredito(): number {
    return this.listCursos.reduce((total, curso) => total + curso.creditos, 0);
  }

  obtenerCursosDeCicloMalla(cicloMalla: any) {
    this.listCursos = [];
    this.selectedCicloMallaId = cicloMalla.target.value;
    this.mallaService.getCursoMallaByCiclo(cicloMalla.target.value).subscribe({
      next: (listCurso: Array<CursoMalla>) => {
        listCurso.forEach((cursoMalla) => {
          const curso = new Curso(
            0,
            cursoMalla.id,
            cursoMalla.tipo,
            0,
            0,
            0,
            cursoMalla.creditos,
            cursoMalla.Nombre
          );
          this.listCursos.push(curso);
        });
      },
      error: (error) => {
        console.error('Error obteniendo cursos:', error);
      },
    });
  }

  quitarCursoDeLista(cursoEliminar: Curso) {
    this.listCursos = this.listCursos.filter(
      (curso) => curso.id !== cursoEliminar.id
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
      console.log(this.cursoSeleccionadoPopUp);
    }
  }

  agregarCurso(): void {
    if (this.cursoSeleccionadoPopUp) {
      const curso = new Curso(
        0,
        this.cursoSeleccionadoPopUp.id,
        this.cursoSeleccionadoPopUp.tipo,
        0,
        0,
        0,
        this.cursoSeleccionadoPopUp.creditos,
        this.cursoSeleccionadoPopUp.Nombre
      );
      this.listCursos.push(curso);
      this.cursoSeleccionadoPopUp = new CursoMalla(0, '', 0, 0, '');
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url.append('file', file, file.name);
    }
  }

  guardarCiclo(): void {
    const cargaArchivos = [
      this.http.post('http://localhost:3000/upload', this.url),
    ];

    forkJoin(cargaArchivos).subscribe({
      next: (response: any[]) => {
        if (this.selectedCiclo) {
          this.selectedCiclo.fecha_inicio = new Date(this.fechaInicioStr);
          this.selectedCiclo.fecha_fin = new Date(this.fechaFinStr);
          this.selectedCiclo.id_ciclo = (this.selectedCicloMallaId = 0)
            ? this.selectedCiclo.id_ciclo
            : this.selectedCicloMallaId;
          this.selectedCiclo.creditos = this.sumarCredito();
          this.cicloService.updateCiclo(this.selectedCiclo).subscribe({
            next: (ciclo: Ciclo) => {
              this.actualizarCursos(ciclo.id, this.listCursos);
              this.cicloService.setSelectedCiclo(ciclo);
              this.router.navigate(['/concepto-modulo-academico']);
            },
          });
        }
      },
    });
  }

  

  actualizarCursos(id_registro_ciclo: number, listCursos: Array<Curso>): void {
    this.cursoService.deleteCursoByCiclo(id_registro_ciclo).subscribe({
      next: () => {
        listCursos.forEach(curso=>{
          curso.id_registro_ciclo = id_registro_ciclo;
          this.guardarCurso(curso);
        })
      }
    })
  }


  guardarCurso(curso: Curso): void {
    this.cursoService.createCurso(curso).subscribe({
      next: () => {
        console.log('Curso guardado exitosamente');
      },
      error: (err) => {
        console.error('Error al guardar curso', err);
      },
    });
  }
}

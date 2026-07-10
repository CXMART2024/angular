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
  listCiclosRegistrados: Array<Ciclo> = [];
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
    '',
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

        // Ciclos ya registrados por el estudiante, para validar que el nuevo
        // ciclo no se solape en rango de fechas con uno existente.
        this.cicloService.getCiclosBySolicitud(this.solicitud.id).subscribe({
          next: (listCiclos: Array<Ciclo>) => {
            this.listCiclosRegistrados = listCiclos ?? [];
          },
          error: (error) => {
            console.error('Error obteniendo ciclos registrados:', error);
            this.listCiclosRegistrados = [];
          },
        });
      }
    });
  }

  // Verifica si el rango [fecha_inicio, fecha_fin] del nuevo ciclo se solapa
  // con el de algún ciclo ya registrado. Dos rangos se solapan cuando
  // inicio_nuevo <= fin_existente AND fin_nuevo >= inicio_existente.
  existeSolapamientoFechas(): boolean {
    const inicioNuevo = new Date(this.ciclo.fecha_inicio).getTime();
    const finNuevo = new Date(this.ciclo.fecha_fin).getTime();

    return this.listCiclosRegistrados.some((c) => {
      const inicioExistente = new Date(c.fecha_inicio).getTime();
      const finExistente = new Date(c.fecha_fin).getTime();
      return inicioNuevo <= finExistente && finNuevo >= inicioExistente;
    });
  }

  obtenerCursosDeCicloMalla(cicloMalla: any) {
    this.selectedCicloMallaId = cicloMalla.target.value;

    // El "Nombre Ciclo/Grado" debe ser igual al nombre del ciclo de la malla
    // seleccionada (no editable), para no permitir duplicados con otro nombre.
    const cicloMallaSel = this.listCicloMalla.find(
      (c) => String(c.id) === String(cicloMalla.target.value),
    );
    this.ciclo.nombre_ciclo = cicloMallaSel?.nombre ?? '';

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
      (curso) => curso.id !== cursoAEliminar.id,
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
      (curso) => curso.id == cursoSeleccionado.target.value,
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
    // Regla #1: no permitir un ciclo cuyo rango de fechas se solape con otro
    // ya registrado (validación en front; el backend también la valida).
    if (this.existeSolapamientoFechas()) {
      this.toastr.error(
        'Ya existe un ciclo registrado dentro del mismo rango de fechas.',
      );
      return;
    }

    if (this.isFileSelected()) {
      // Con "Constancia de Matrícula" adjunta: subir el archivo y luego crear.
      this.http
        .post('https://backendbecas.azurewebsites.net/upload', this.url)
        .subscribe({
          next: (response: any) => {
            this.crearCiclo(response?.url ?? '');
          },
          error: (err) => {
            console.error('Error subiendo constancia:', err);
            this.toastr.error('Error al subir la constancia de matrícula');
          },
        });
    } else {
      // Regla #5: la constancia es opcional en el primer registro; se puede
      // regularizar después. Se crea el ciclo sin documento de matrícula.
      this.crearCiclo('');
    }
  }

  private crearCiclo(idDocMatricula: string): void {
    this.ciclo.id_ciclo = this.selectedCicloMallaId;
    this.ciclo.id_solicitud = this.solicitud.id;
    this.ciclo.id_doc_matricula = idDocMatricula;
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
            curso.Nombre,
          );
          this.guardarCurso(newCurso);
        }
        this.toastr.success(`Ciclo registrado correctamente`);
        this.router.navigate(['informacion-view']);
      },
      error: (err) => {
        // El backend responde 409 cuando el rango de fechas se solapa.
        if (err?.status === 409) {
          this.toastr.error(
            err?.error?.message ||
              'Ya existe un ciclo registrado dentro del mismo rango de fechas.',
          );
        } else {
          this.toastr.error(`Error al guardar ciclo`);
        }
      },
    });
  }

  guardarCurso(curso: Curso): void {
    this.cursoService.createCurso(curso).subscribe({
      next: () => {},
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

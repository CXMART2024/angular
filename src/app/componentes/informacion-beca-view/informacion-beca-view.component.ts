import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Ciclo } from '../../modelos/ciclo';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { CursoMalla } from '../../modelos/curso-malla';
import { CursoService } from '../../servicios/curso/curso.service';
import { Curso } from '../../modelos/curso';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { forkJoin } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-informacion-beca-view',
  templateUrl: './informacion-beca-view.component.html',
  styleUrl: './informacion-beca-view.component.css',
})
export class InformacionBecaViewComponent implements OnInit {

  solicitud: any;
  listCiclos: Array<Ciclo> = [];
  numCursosMap = new Map<number, number>();
  mallaCurricular: any[] = [];

  registrarCicloBool: boolean = false;
  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]]
  });

  constructor(
    private solicitudService: SolicitudService,
    private mallaService: MallaCurricularService,
    private cicloService: CicloService,
    private cursoService: CursoService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe((data) => {
      this.solicitud = data;
      if (this.solicitud) {
        this.getCiclos();
        this.getMallaCurricular();

        this.formUpdateLogin.patchValue({
          dni: this.solicitud.dni
        });

      }

    });
    this.cdr.detectChanges();
  }

  getMallaCurricular(): void {
    // Obtener los ciclos asociados a la solicitud
    this.mallaService
      .getCiclosMallaBySolicitud(this.solicitud.id)
      .pipe(
        switchMap((ciclos: any[]) => {
          // Crear un array de observables para obtener los cursos de cada ciclo
          const ciclosConCursosObservables = ciclos.map((ciclo) =>
            this.mallaService.getCursoMallaByCiclo(ciclo.id).pipe(
              // Adjuntar los cursos al ciclo
              switchMap((cursos: any[]) => {
                ciclo.cursos = cursos;
                return [ciclo]; // Retornar ciclo con los cursos adjuntos
              })
            )
          );
          // Ejecutar todos los observables en paralelo y juntar los resultados
          return forkJoin(ciclosConCursosObservables);
        })
      )
      .subscribe({
        next: (ciclosConCursos: any[]) => {
          this.mallaCurricular = ciclosConCursos;
        },
        error: (error) => {
          console.error('Error al obtener ciclos o cursos:', error);
        },
      });
  }

  getCiclos(): void {
    this.cicloService.getCiclosBySolicitud(this.solicitud.id).subscribe({
      next: (listCiclo: Array<Ciclo>) => {
        this.listCiclos = listCiclo;
        this.viewRegistrarCiclo();
        this.listCiclos.forEach((ciclo) => {
          try {
            this.cursoService.getCursoByCiclo(ciclo.id).subscribe({
              next: (listCursos: Array<Curso>) => {
                this.numCursosMap.set(ciclo.id, listCursos.length);
              },
            });
          } catch (error) {
            console.error('Error obteniendo el número de cursos', error);
          }
        });
        this.cdr.detectChanges();
      },
    });
  }

  //Seleccionar Ciclo
  selectCiclo(ciclo: Ciclo): void {
    this.cicloService.setSelectedCiclo(ciclo);
    this.router.navigate(['/concepto-modulo-academico']);
  }


  viewRegistrarCiclo(): void {
    this.registrarCicloBool = (
      this.listCiclos.filter((ciclo) => ciclo.estado == 'En Proceso').length == 0
      && this.solicitud.MallaEstado == 'Aprobado'
    );
  }

  logout() {
    this.authService.logout()
  }

  updateLogin() {

    const dni: string = this.formUpdateLogin.get('dni')?.value as string;
    const antiguaClave: string = this.formUpdateLogin.get('antiguaClave')?.value as string;
    const nuevaClave: string = this.formUpdateLogin.get('nuevaClave')?.value as string;


    this.authService.actualizarClave(dni, antiguaClave, nuevaClave).subscribe({
      next: (response: any) => {
        this.formUpdateLogin.reset();
        this.toastr.success(`Se actualizó correctamente.`);
      },
      error: (error: any) => {
        console.error('Error actualizando clave', error);
        this.formUpdateLogin.reset();
        this.toastr.error(`Error actualizando clave. Por favor, refresca la página y vuelve a intentarlo.`);
      }
    });
  }
}

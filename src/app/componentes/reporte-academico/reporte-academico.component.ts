import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CursoService } from '../../servicios/curso/curso.service';
import { Curso } from '../../modelos/curso';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Ciclo } from '../../modelos/ciclo';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
declare var bootstrap: any;

interface PromedioCiclo {
  label: string;
  promedio: number;
}

@Component({
  selector: 'app-reporte-academico',
  templateUrl: './reporte-academico.component.html',
  styleUrl: './reporte-academico.component.css'
})
export class ReporteAcademicoComponent implements OnInit {

  solicitud: any;
  selectedCicloId: number = 0;
  listCurso: Array<Curso> = [];
  promedio: number = 0;
  promedioGeneral: number = 0;
  cicloData: Ciclo | null = null;
  listCiclo: Array<Ciclo> = [];

  // Datos y geometría del gráfico "Promedio por Ciclo"
  chartData: Array<PromedioCiclo> = [];
  cargandoGrafico: boolean = false;
  readonly notaMaxima: number = 20;
  readonly yTicks: number[] = [20, 16, 12, 8, 4, 0];
  readonly chartWidth: number = 520;
  readonly chartHeight: number = 260;
  readonly padding = { top: 24, right: 24, bottom: 40, left: 40 };

  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]]
  });

  constructor(private solicitudService: SolicitudService, private authService: AuthService,
    private formBuilder: FormBuilder, private toastr: ToastrService, private cursoAcademico: CursoService, private cicloAcademico: CicloService, private cdr: ChangeDetectorRef) {

  }
  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if (this.solicitud) {
        this.formUpdateLogin.patchValue({
          dni: this.solicitud.dni
        });


        this.cicloAcademico.getCiclosBySolicitud(this.solicitud.id)
          .subscribe({
            next: (listCiclo: Array<Ciclo>) => {
              this.listCiclo = listCiclo;
              this.construirGrafico();
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error obteniendo ciclos:', error);
            },
          });


      }
    });
  }

  // Construye el promedio por ciclo y el promedio general acumulado
  construirGrafico(): void {
    if (!this.listCiclo || this.listCiclo.length === 0) {
      this.chartData = [];
      this.promedioGeneral = 0;
      this.promedio = 0;
      return;
    }

    this.cargandoGrafico = true;

    const peticiones = this.listCiclo.map((ciclo) =>
      this.cursoAcademico.getCursoByCiclo(ciclo.id).pipe(
        catchError(() => of([] as Curso[])),
      ),
    );

    forkJoin(peticiones).subscribe({
      next: (resultados: Array<Curso[]>) => {
        let totalNotas = 0;
        let totalCursos = 0;

        this.chartData = resultados.map((cursos, index) => {
          const notas = (cursos || []).filter((c) => c.nota != null);
          const suma = notas.reduce((total, c) => total + (c.nota || 0), 0);
          totalNotas += suma;
          totalCursos += notas.length;
          const promedioCiclo = notas.length ? suma / notas.length : 0;
          return {
            label: this.listCiclo[index]?.nombre_ciclo ?? `Ciclo ${index + 1}`,
            promedio: parseFloat(promedioCiclo.toFixed(2)),
          };
        });

        this.promedioGeneral = totalCursos
          ? parseFloat((totalNotas / totalCursos).toFixed(2))
          : 0;
        // Por defecto el recuadro muestra el promedio general acumulado
        this.promedio = this.promedioGeneral;
        this.cargandoGrafico = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error construyendo el gráfico de promedios:', error);
        this.chartData = [];
        this.cargandoGrafico = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ---- Geometría del gráfico SVG ----
  private get plotWidth(): number {
    return this.chartWidth - this.padding.left - this.padding.right;
  }

  private get plotHeight(): number {
    return this.chartHeight - this.padding.top - this.padding.bottom;
  }

  getX(index: number): number {
    if (this.chartData.length <= 1) {
      return this.padding.left + this.plotWidth / 2;
    }
    return this.padding.left + (this.plotWidth * index) / (this.chartData.length - 1);
  }

  getY(valor: number): number {
    const acotado = Math.max(0, Math.min(valor, this.notaMaxima));
    return this.padding.top + this.plotHeight * (1 - acotado / this.notaMaxima);
  }

  get linePoints(): string {
    return this.chartData
      .map((d, i) => `${this.getX(i)},${this.getY(d.promedio)}`)
      .join(' ');
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

  obtenerCursosDeCiclo(ciclo: any) {
    this.selectedCicloId = ciclo.target.value;

    this.cursoAcademico.getCursoByCiclo(this.selectedCicloId).subscribe({
      next: (listCurso: Array<Curso>) => {
        this.listCurso = listCurso;

        this.promedio = this.sumarPromedio();



      },
      error: (error) => {
        console.error('Error obteniendo cursos:', error);
      },
    });

    this.getDataCiclo();
  }

  sumarPromedio(): number {
    if (this.listCurso.length === 0) return 0;
    const totalNotas = this.listCurso.reduce((total, curso) => total + (curso.nota || 0), 0);
    const promedio = totalNotas / this.listCurso.length;
    //console.log(`Total Notas: ${totalNotas}, Promedio: ${promedio}`);
    return parseFloat(promedio.toFixed(2));
  }

  getDataCiclo(): void {
    this.cicloAcademico.getCiclo(this.selectedCicloId).subscribe({
      next: (cicloDetails: Ciclo[]) => {
        if (cicloDetails.length > 0) {
          this.cicloData = cicloDetails[0];
        } else {
          this.cicloData = null;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error obteniendo ciclo:', error);
      }
    });
  }

}

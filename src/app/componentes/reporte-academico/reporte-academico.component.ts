import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CursoService } from '../../servicios/curso/curso.service';
import { Curso } from '../../modelos/curso';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Ciclo } from '../../modelos/ciclo';
declare var bootstrap: any;

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
  cicloData: Ciclo | null = null;
  listCiclo: Array<Ciclo> = [];

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
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error obteniendo ciclos:', error);
            },
          });


      }
    });
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

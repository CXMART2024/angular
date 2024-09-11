import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth.service';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursoService } from '../../servicios/curso/curso.service';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Ciclo } from '../../modelos/ciclo';
import moment from 'moment';
import { catchError, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { RelacionCiclo } from '../../modelos/relacion-ciclo';
import { Curso } from '../../modelos/curso';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-detalle-academico',
  templateUrl: './detalle-academico.component.html',
  styleUrl: './detalle-academico.component.css'
})


export class DetalleAcademicoComponent implements OnInit {


  solicitud: any;
  isChecked: boolean = false;
  listCiclo: Array<Ciclo> = [];
  cicloData: Ciclo | null = null;
  listCurso: Array<Curso> = [];
  selectedCicloId: number = 0;
  promedio: number = 0
  cicloCursoRelacion?: RelacionCiclo[];
  id_documento_evidencia = new FormData();
  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]]
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private solicitudService: SolicitudService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private cursoAcademico: CursoService,
    private cicloAcademico: CicloService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private toastr: ToastrService
  ) {

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
      if (this.solicitud.contratoBecario == '0') {
        this.showModal();
      }

    });

    this.cdr.detectChanges();
  }

  showModal() {
    // Wait for the DOM to be ready
    setTimeout(() => {
      // Ensure the global `window` object has access to Bootstrap's modal
      const modalElement = document.getElementById('contrato_becario');
      if (modalElement && (window as any).bootstrap) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show(); // Show the modal automatically
      }
    }, 0);
  }

  // Method to update checkbox status
  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isChecked = input.checked;
  }


  logout() {
    this.authService.logout()
  }

  aceptarContrato(solicitudData: any) {
    solicitudData.contratoBecario = '1';
    
    this.solicitudService.updateSolicitud(solicitudData).subscribe({
      next: (response: any) => {
        
      }
    })
  }

  /*Resetear los controles al actualizar*/
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


  formatDate(date: Date | null): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd', 'UTC') || '' : '';
  }


  updateCursos() {
    if (!this.cicloCursoRelacion) return;

    const updateRequests = this.cicloCursoRelacion.flatMap(ciclo =>
      ciclo.cursos.map(curso => this.cursoAcademico.updateCurso(curso))
    );


    forkJoin(updateRequests).subscribe({
      next: (responses) => {
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error actualizando cursos', error);
      }
    });
  }


  onFileChange_id_documento_evidencia(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.id_documento_evidencia.append('file', file, file.name);
    }
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

  updateInformacionBecario() {
    const cargaArchivos: Observable<any>[] = [];
    const cursoUpdateRequests: Observable<any>[] = [];

    if (this.id_documento_evidencia.has('file')) {
      cargaArchivos.push(this.http.post('https://backendbecas.azurewebsites.net/upload', this.id_documento_evidencia));
    }

    this.listCurso.forEach(curso => {
      if (curso.nota) {
        cursoUpdateRequests.push(this.cursoAcademico.updateCurso(curso));
      }
    });


    forkJoin([...cargaArchivos, ...cursoUpdateRequests]).subscribe({
      next: (responses: any[]) => {
        let fileUrl = '';
        if (cargaArchivos.length > 0) {
          if (responses.length > 0) {
            fileUrl = responses[0].url;
          }
        }

        const selectedId = +this.selectedCicloId;
        const cicloToUpdate = this.listCiclo.find(ciclo => ciclo.id === selectedId);

        if (cicloToUpdate) {
          cicloToUpdate.id_documento_evidencia = fileUrl;

          this.cicloAcademico.updateCiclo(cicloToUpdate).subscribe({
            next: (response: any) => {
              
              this.toastr.success(`Se actualizó correctamente.`);
              this.id_documento_evidencia = new FormData();
              this.selectedCicloId = 0;
              this.cdr.detectChanges();

            },
            error: (error: any) => {
              console.error('Error al actualizar ciclo', error);
              this.toastr.error(`Error al actualizar ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
            }
          });
        } else {
          console.error('Ciclo no encontrado para actualizar');
          this.toastr.error(`Error al actualizar ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
        }
      },
      error: (error: any) => {
        console.error('Error subiendo archivos o actualizando cursos', error);
        this.toastr.error(`Error subiendo archivos o actualizando cursos. Por favor, refresca la página y vuelve a intentarlo.`);
      }
    });
  }

  contarCursos(): number {
    return this.listCurso.length;
  }

  sumarCredito(): number {
    return this.listCurso.reduce((total, curso) => total + curso.creditos, 0);
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

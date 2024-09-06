import { ChangeDetectorRef, Component, ElementRef, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth.service';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursoService } from '../../servicios/curso/curso.service';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Ciclo } from '../../modelos/ciclo';
import moment from 'moment';
import { forkJoin, map } from 'rxjs';
import { RelacionCiclo } from '../../modelos/relacion-ciclo';
import { Curso } from '../../modelos/curso';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detalle-academico',
  templateUrl: './detalle-academico.component.html',
  styleUrl: './detalle-academico.component.css'
})


export class DetalleAcademicoComponent implements OnInit {

  solicitud: any;
  isChecked: boolean = false;
  ciclosAcademicos: Ciclo[] = [];
  cursosAcademicos: Curso[] = [];
  cicloCursoRelacion?: RelacionCiclo[];
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
    private datePipe: DatePipe

  ) {

  }

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if (this.solicitud) {
        this.formUpdateLogin.patchValue({
          dni: this.solicitud.dni
        });
      }
      if (this.solicitud.contratoBecario == '0') {
        this.showModal();
      }

      this.getAllCiclosAcademicos();

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
    console.log(solicitudData);
    this.solicitudService.updateSolicitud(solicitudData).subscribe({
      next: (response: any) => {
        console.log(response);
      }
    })
  }

  updateLogin() {

    const dni: string = this.formUpdateLogin.get('dni')?.value as string;
    const antiguaClave: string = this.formUpdateLogin.get('antiguaClave')?.value as string;
    const nuevaClave: string = this.formUpdateLogin.get('nuevaClave')?.value as string;



    this.authService.actualizarClave(dni, antiguaClave, nuevaClave).subscribe({
      next: (response: any) => {
        console.log('Clave actualizada correctamente', response);

      },
      error: (error: any) => {
        console.error('Error actualizando clave', error);
        console.log('---');
        console.log(error.error.message);


      }
    });
  }

  getAllCiclosAcademicos(): void {
    if (this.solicitud && this.solicitud.id) {
      this.cicloAcademico.getCiclosBySolicitud(this.solicitud.id).subscribe({
        next: (ciclos: Array<Ciclo>) => {
          this.ciclosAcademicos = ciclos;

          this.fetchCursosForCiclos(ciclos);


          console.log('Ciclos academicos recibidos y formateados exitosamente', this.ciclosAcademicos);
        },
        error: (error) => {
          console.error('Error al obtener ciclos academicos', error);
        }
      });
    } else {
      console.error('Solicitud ID no disponible');
    }
  }


  fetchCursosForCiclos(ciclos: Ciclo[]) {
    if (ciclos.length === 0) {
      return;
    }

    const cursoRequests = ciclos.map(ciclo =>
      this.cursoAcademico.getCursoByCiclo(ciclo.id).pipe(
        map(cursos => ({ ciclo, cursos }))
      )
    );

    forkJoin(cursoRequests).subscribe({
      next: (cicloCursoPairs: RelacionCiclo[]) => {
        this.cicloCursoRelacion = cicloCursoPairs;
        console.log('Ciclos y Cursos recibidos:', cicloCursoPairs);
      },
      error: (error) => {
        console.error('Error fetching cursos', error);
      }
    });
  }


  formatDate(date: Date | null): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd', 'UTC') || '' : '';
  }



}

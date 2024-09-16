import { ChangeDetectorRef, Component, OnInit, viewChild, ElementRef, ViewChild } from '@angular/core';
import { Ciclo } from '../../modelos/ciclo';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Router } from '@angular/router';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { Curso } from '../../modelos/curso';
import { CursoService } from '../../servicios/curso/curso.service';
import { Pago } from '../../modelos/pago';
import { PagoService } from '../../servicios/pago/pago.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../servicios/auth/auth.service';

@Component({
  selector: 'app-concepto-ciclo-academico',
  templateUrl: './concepto-ciclo-academico.component.html',
  styleUrl: './concepto-ciclo-academico.component.css'
})
export class ConceptoCicloAcademicoComponent implements OnInit {

  @ViewChild('constanciaFile') constanciaFile!: ElementRef;

  conceptoPagoForm: FormGroup = new FormGroup({
    concepto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    monto: new FormControl('', [Validators.required, Validators.min(1)]),
    fechaSolicitud: new FormControl('', Validators.required)
  })

  fechaConceptoPago: string = '';
  url = new FormData();
  pago: Pago = new Pago(0, new Date, 0, '', '', '', 0, 0, '', '', '', '', '');
  selectedPago: Pago | null = null;
  solicitud: any;
  selectedCiclo: Ciclo | null = null;
  listCursos: Array<Curso> = [];
  listPagos: Array<Pago> = [];
  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]]
  });

  constructor(
    private router: Router,
    private solicitudService: SolicitudService,
    private cicloService: CicloService,
    private cursoService: CursoService,
    private pagoService: PagoService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder,

  ) { }

  ngOnInit(): void {

    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if (this.solicitud) {
        this.selectedCiclo = this.cicloService.getSelectedCiclo();
        if (this.selectedCiclo) {
          this.getCursosCiclo(this.selectedCiclo.id);
          this.getPagosCiclo(this.selectedCiclo.id);
          this.cdr.detectChanges();
        };

        const myModal = document.getElementById('addConcepto');
        if (myModal) {
          myModal.addEventListener('shown.bs.modal', () => {
            this.conceptoPagoForm.reset(); // Reset form when modal is shown
          })
        }
        this.formUpdateLogin.patchValue({
          dni: this.solicitud.dni
        });
      }
    })
  }

  onAgregarConceptoPago(): void {
    if (this.conceptoPagoForm.valid) {
      let pago = this.pago;
      pago.id_solicitud = this.solicitud.id;
      pago.id_registroCiclo = this.selectedCiclo?.id ?? 0;
      pago.fecha_solicitud = this.conceptoPagoForm.value.fechaSolicitud;
      pago.concepto = this.conceptoPagoForm.value.concepto;
      pago.descripcion = this.conceptoPagoForm.value.descripcion;
      pago.monto = this.conceptoPagoForm.value.monto;
      pago.PagoEstado = 'Programado';
      pago.adminestado = 'Programado';
      this.pagoService.createPago(pago).subscribe({
        next: (newPago: Pago) => {
          if (this.selectedCiclo) {
            this.getPagosCiclo(this.selectedCiclo.id);
            this.toastr.success(`Pago ${newPago.concepto} registrado correctamente`)
          }
        },
        error: (error) => {
          this.toastr.error(`Ha ocurrido un error, no se ha podido registrar el pago correctamente`)
        }
      })
    } else {
      this.toastr.error(`Ha ocurrido un error, no se ha podido registrar el pago correctamente`)
    }
  }

  //Obtener cursos del ciclo
  getCursosCiclo(id_ciclo: number) {
    this.cursoService.getCursoByCiclo(id_ciclo).subscribe({
      next: (listCurso: Array<Curso>) => {
        this.listCursos = listCurso;
        this.cdr.detectChanges();
      }
    })
  }

  //Obtener pagos del ciclo
  getPagosCiclo(id_ciclo: number) {
    this.pagoService.getPagoByCiclo(id_ciclo).subscribe({
      next: (listPagos: Array<Pago>) => {
        this.listPagos = listPagos;
      }
    })
  }


  //Retorna el numero de cursos
  getNumCursos(): number {
    return this.cursoService.getNumCursos(this.listCursos);
  }

  //Retorna el total de creditos
  getTotaCreditos(): number {
    return this.cursoService.getTotalCreditos(this.listCursos);
  }


  //Volver pantalla anterior
  regresarInformacionBeca() {
    this.cicloService.clearSelectedCiclo();
    this.router.navigate(['/informacion-view']);
  }

  //Setear pago a editar
  setSelectedPago(pago: Pago): void {
    this.selectedPago = pago;
    this.url = new FormData();
    this.fechaConceptoPago = this.datePipe.transform(pago.fecha_solicitud, 'yyyy-MM-dd') ?? ''
  }

  //Al agregar archivo
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url.append('file', file, file.name)
    }
  }

  //Verificar si hay un archivo seleccionado
  isFileSelected(): boolean {
    return this.url.has('file');
  }

  //Resetear campo file
  resetFileInput(): void {
    if (this.constanciaFile && this.constanciaFile.nativeElement) {
      this.constanciaFile.nativeElement.value = '';
      this.url.delete('file');
    }
  }

  //ACtualizar concepto pago
  updateConceptoPago(): void {
    const cargaArchivos = [
      this.http.post('https://backendbecas.azurewebsites.net/upload', this.url)
    ]

    forkJoin(cargaArchivos).subscribe({
      next: (response: any[]) => {
        if (this.selectedPago) {
          this.selectedPago.id_constancia_pago = response[0].url;
          this.selectedPago.PagoEstado = 'Enviado';
          this.selectedPago.ContabilidadEstado = 'Por Revisar';
          this.selectedPago.fecha_solicitud = new Date(this.fechaConceptoPago);
          this.pagoService.updatePago(this.selectedPago).subscribe({
            next: (pago: Pago) => {
              this.toastr.success(`Pago ${pago.concepto} registrado correctamente`)
            },
            error: (error) => {
              this.toastr.error(`Ha ocurrido un error, no se ha podido registrar el pago correctamente`)
            }
          })
        }
      }
    })
  }

  //Colores de fondo estado
  getColorByState(pagoEstado: string): string {
    switch (pagoEstado) {
      case 'Programado':
        return 'rgba(255,249,196,1)';
      case 'Pagado':
        return 'rgba(167,198,235,1)';
      case 'Enviado':
        return 'rgba(255,224,130,1)';
      case 'Aprobado':
        return 'rgba(200, 230, 201, 1)';
      case 'Observado':
        return 'rgba(248, 187, 208, 1)';
      default:
        return 'rgba(255, 255, 255, 1)';
    }
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

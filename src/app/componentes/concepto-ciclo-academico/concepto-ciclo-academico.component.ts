import { ChangeDetectorRef, Component, OnInit, viewChild, ElementRef, ViewChild } from '@angular/core';
import { Ciclo } from '../../modelos/ciclo';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Router } from '@angular/router';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { Curso } from '../../modelos/curso';
import { CursoService } from '../../servicios/curso/curso.service';
import { Pago } from '../../modelos/pago';
import { PagoService } from '../../servicios/pago/pago.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-concepto-ciclo-academico',
  templateUrl: './concepto-ciclo-academico.component.html',
  styleUrl: './concepto-ciclo-academico.component.css'
})
export class ConceptoCicloAcademicoComponent implements OnInit{

  @ViewChild('constanciaFile') constanciaFile!: ElementRef;

  conceptoPagoForm: FormGroup = new FormGroup({
    concepto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    monto: new FormControl('', [Validators.required, Validators.min(1)]),
    fechaSolicitud: new FormControl('', Validators.required)
  })

  fechaConceptoPago: string = '';
  url = new FormData();
  pago: Pago = new Pago(0,new Date,0,'','','',0,0,'','','','','');
  selectedPago: Pago | null = null;
  solicitud: any;
  selectedCiclo: Ciclo | null = null;
  listCursos: Array<Curso> = [];
  listPagos: Array<Pago> = [];
  
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
  ) {}

  ngOnInit(): void {
    
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if(this.solicitud){
        this.selectedCiclo = this.cicloService.getSelectedCiclo();
        if(this.selectedCiclo){
          this.getCursosCiclo(this.selectedCiclo.id);
          this.getPagosCiclo(this.selectedCiclo.id);
          this.cdr.detectChanges();
        }
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
      pago.EstudianteEstado = 'Programado';
      pago.PagoEstado = 'Programado';
      pago.TesoreriaEstado = 'Programado';
      pago.ContabilidadEstado = 'Programado';
      pago.adminestado = 'Programado';
      
      this.pagoService.createPago(pago).subscribe({
        next: (newPago: Pago) => {
          if(this.selectedCiclo) {
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
  getTotaCreditos(): number{
    return this.cursoService.getTotalCreditos(this.listCursos);
  }


  //Volver pantalla anterior
  regresarInformacionBeca(){
    this.cicloService.clearSelectedCiclo();
    this.router.navigate(['/informacion']);
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
        if (this.selectedPago){
          this.selectedPago.id_constancia_pago = response[0].url;
          this.selectedPago.EstudianteEstado= 'En Trámite'
          this.selectedPago.adminestado= 'Solicitado'
          this.selectedPago.PagoEstado= 'Solicitado'
          this.selectedPago.TesoreriaEstado= 'Solicitado'
          this.selectedPago.ContabilidadEstado= 'Solicitado'
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

}

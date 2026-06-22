import {
  ChangeDetectorRef,
  Component,
  OnInit,
  viewChild,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Ciclo } from '../../modelos/ciclo';
import { CicloService } from '../../servicios/ciclo/ciclo.service';
import { Router } from '@angular/router';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { Curso } from '../../modelos/curso';
import { CursoService } from '../../servicios/curso/curso.service';
import { Pago } from '../../modelos/pago';
import { PagoService } from '../../servicios/pago/pago.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../servicios/auth/auth.service';

@Component({
  selector: 'app-concepto-ciclo-academico',
  templateUrl: './concepto-ciclo-academico.component.html',
  styleUrl: './concepto-ciclo-academico.component.css',
})
export class ConceptoCicloAcademicoComponent implements OnInit {
  @ViewChild('constanciaFile') constanciaFile!: ElementRef;

  simboloMoneda: string = 'S/';

  conceptoPagoForm: FormGroup = new FormGroup({
    concepto: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    monto: new FormControl(0, [Validators.required, Validators.min(1)]),
    nro_cuentabancaria: new FormControl('', Validators.required),
    codigo_sociedad: new FormControl(''),
    ceco: new FormControl(''),

    area_solicitante: new FormControl(''),
    moneda: new FormControl('', Validators.required),
    fecha_regularizacion: new FormControl(null),
    fechaSolicitud: new FormControl('', Validators.required),
  });

  fechaConceptoPago: string = '';
  url = new FormData();
  pago: Pago = new Pago(
    0,
    new Date(),
    0,
    '',
    '',
    '',
    0,
    0,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    new Date(),
    new Date(),
  );
  selectedPago: Pago | null = null;
  ultimoPago: Pago | null = null;
  solicitud: any;
  selectedCiclo: Ciclo | null = null;
  listCursos: Array<Curso> = [];
  listPagos: Array<Pago> = [];
  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]],
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
  ) {}

  ngOnInit(): void {
    this.conceptoPagoForm.get('moneda')?.valueChanges.subscribe((moneda) => {
      if (moneda === 'Soles') {
        this.simboloMoneda = 'S/';
      } else if (moneda === 'Dolares') {
        this.simboloMoneda = '$';
      } else {
        this.simboloMoneda = 'S/';
      }
    });
    this.solicitudService.getSolicitudData().subscribe((data) => {
      this.solicitud = data;
      if (this.solicitud) {
        this.selectedCiclo = this.cicloService.getSelectedCiclo();
        if (this.selectedCiclo) {
          this.getCursosCiclo(this.selectedCiclo.id);
          this.getPagosCiclo(this.selectedCiclo.id);
          this.cdr.detectChanges();
        }

        console.log('este es el ciclo seleccionado', this.selectedCiclo);

        // Cargamos el último pago del estudiante para autocompletar el modal
        // "Nuevo Concepto" con su cuenta bancaria y la última moneda usada.
        this.cargarUltimoPago();

        const myModal = document.getElementById('addConcepto');
        if (myModal) {
          myModal.addEventListener('shown.bs.modal', () => {
            this.conceptoPagoForm.reset(); // Reset form when modal is shown
            this.prefillDatosUltimoPago(); // Autocompletar luego del reset
          });
        }
        this.formUpdateLogin.patchValue({
          dni: this.solicitud.dni,
        });
      }
    });
  }

  obtenerNombreArchivo(url: string | null | undefined): string {
    if (!url) {
      return 'Sin Archivo';
    }

    const nombreArchivo = url.split('/').pop();

    return nombreArchivo ? decodeURIComponent(nombreArchivo) : 'Sin Archivo';
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
      pago.nro_cuentabancaria = this.conceptoPagoForm.value.nro_cuentabancaria;
      pago.codigo_sociedad = 'FC01';
      pago.ceco = 'FC19101011';
      pago.area_solicitante = 'Gerencia';
      pago.moneda = this.conceptoPagoForm.value.moneda;
      pago.fecha_regularizacion =
        this.conceptoPagoForm.value.fecha_regularizacion;
      pago.PagoEstado = 'Programado';
      pago.adminestado = 'Programado';

      this.pagoService.createPago(pago).subscribe({
        next: (newPago: Pago) => {
          const idpagocreado = newPago.id;
          if (this.selectedCiclo) {
            this.getPagosCiclo(this.selectedCiclo.id);
            this.toastr.success(
              `Pago ${newPago.concepto} registrado correctamente`,
            );

            // Llamada al automate
            this.dispararAutomate(idpagocreado);
          }
        },
        error: (error) => {
          this.toastr.error(
            `Ha ocurrido un error, no se ha podido registrar el pago correctamente`,
          );
        },
      });
    } else {
      this.toastr.error(
        `Ha ocurrido un error, no se ha podido registrar el pago correctamente`,
      );
    }
  }

  private dispararAutomate(idpagocreado: number): void {
    const url =
      'https://603b3a18bfeaef3c8fc4a002f51b5c.e1.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/d5be7c5f58374bce9462926003ebcf93/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=mk52c_itGiWZUiM-yhN3JLKZ2Wd_Onf5SQYOpfmIpXI';

    const body = {
      id_solicitud: this.solicitud.id,
      id_concepto: idpagocreado,
      // agrega aquí los campos que necesite tu automate
    };

    this.http.post(url, body).subscribe({
      next: () => {
        console.log('Automate disparado correctamente');
      },
      error: (error) => {
        console.error('Error al disparar el automate:', error);
      },
    });
  }

  //Obtener cursos del ciclo
  getCursosCiclo(id_ciclo: number) {
    this.cursoService.getCursoByCiclo(id_ciclo).subscribe({
      next: (listCurso: Array<Curso>) => {
        this.listCursos = listCurso;
        this.cdr.detectChanges();
      },
    });
  }

  //Obtener pagos del ciclo
  getPagosCiclo(id_ciclo: number) {
    this.pagoService.getPagoByCiclo(id_ciclo).subscribe({
      next: (listPagos: Array<Pago>) => {
        this.listPagos = listPagos;
      },
    });
  }

  //Obtener el último pago del estudiante (para autocompletar el modal).
  cargarUltimoPago(): void {
    if (!this.solicitud?.id) {
      return;
    }
    this.pagoService.getUltimoPagoBySolicitud(this.solicitud.id).subscribe({
      next: (pago: Pago | null) => {
        this.ultimoPago = pago;
      },
      error: (error) => {
        // Si falla, simplemente no autocompletamos; el modal abre vacío.
        console.error('Error obteniendo el último pago', error);
        this.ultimoPago = null;
      },
    });
  }

  //Autocompletar cuenta bancaria y moneda con el último pago, si existe.
  //Los campos quedan editables. Si el estudiante no tiene pagos previos
  //(ultimoPago === null) no se setea nada y el formulario queda en blanco.
  prefillDatosUltimoPago(): void {
    if (!this.ultimoPago) {
      return;
    }
    const datos: { nro_cuentabancaria?: string; moneda?: string } = {};
    if (this.ultimoPago.nro_cuentabancaria) {
      datos.nro_cuentabancaria = this.ultimoPago.nro_cuentabancaria;
    }
    if (this.ultimoPago.moneda) {
      datos.moneda = this.ultimoPago.moneda;
    }
    this.conceptoPagoForm.patchValue(datos);
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
    this.fechaConceptoPago =
      this.datePipe.transform(pago.fecha_solicitud, 'yyyy-MM-dd') ?? '';
  }

  //Al agregar archivo
  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url.append('file', file, file.name);
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
      this.http.post('https://backendbecas.azurewebsites.net/upload', this.url),
    ];

    forkJoin(cargaArchivos).subscribe({
      next: (response: any[]) => {
        if (this.selectedPago) {
          this.selectedPago.id_constancia_pago = response[0].url;
          this.selectedPago.PagoEstado = 'Por Aprobar';
          this.selectedPago.ContabilidadEstado = 'Por Revisar';
          this.selectedPago.fecha_solicitud = new Date(this.fechaConceptoPago);
          this.pagoService.updatePago(this.selectedPago).subscribe({
            next: (pago: Pago) => {
              this.toastr.success(
                `Pago ${pago.concepto} registrado correctamente`,
              );
              this.enviarCorreoVoucher();
            },
            error: (error) => {
              this.toastr.error(
                `Ha ocurrido un error, no se ha podido registrar el pago correctamente`,
              );
            },
          });
        }
      },
    });
  }

  enviarCorreoVoucher() {
    // 1. Obtenemos el ID de la solicitud desde el pago seleccionado
    const idSolicitud = this.selectedPago?.id_solicitud; // <-- Cambia aquí según cómo se llame el campo id en tu modelo 'Contabilidad'

    if (!idSolicitud) {
      this.toastr.error(
        'No se encontró el ID de la solicitud asociado a este pago.',
      );
      return;
    }

    // 2. Buscamos la solicitud por su ID antes de armar el envío
    this.solicitudService.getSolicitudById(this.solicitud.id).subscribe({
      next: (solicitudObtenida: any) => {
        if (!solicitudObtenida) {
          this.toastr.error(
            'No se encontró ninguna solicitud con el ID proporcionado.',
          );
          return;
        }

        // 3. Si la encuentra con éxito, armamos el payload para el correo
        const payload = {
          solicitante: {
            nombre_completo: solicitudObtenida.nombre_completo,
            codigo_estudiante: solicitudObtenida.codigo_estudiante,
          },
          pago: {
            id: this.selectedPago?.id || '',
            concepto: this.selectedPago?.concepto || '',
            descripcion: this.selectedPago?.descripcion || '',
            importe_total: this.selectedPago?.monto || '',
          },
          operadorContabilidad: {
            nombre_completo: 'Contabilidad',
            correo: 'soportebi_fo@crosland.com.pe',
          },
          administrador: {
            correo: 'soportebi_fo@crosland.com.pe',
          },
          tesoreria: {
            correo: 'soportebi_fo@crosland.com.pe',
          },
          diasLimite: 3,
        };

        // 4. Enviamos el correo
        this.http
          .post(
            'https://backendbecas.azurewebsites.net/correo/voucher',
            payload,
          )
          .subscribe({
            next: () => {
              this.toastr.success('Correo enviado correctamente.');
            },
            error: (error) => {
              console.error('Error enviando correo:', error);
              this.toastr.error('Error al enviar el correo.');
            },
          });
      },
      error: (err) => {
        console.error('Error al buscar la solicitud por ID:', err);
        this.toastr.error(
          'Error al verificar los datos de la solicitud en el servidor.',
        );
      },
    });
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
      case 'Por Aprobar':
        return 'rgba(255, 224, 178, 1)';
      default:
        return 'rgba(255, 255, 255, 1)';
    }
  }

  logout() {
    this.authService.logout();
  }

  updateLogin() {
    const dni: string = this.formUpdateLogin.get('dni')?.value as string;
    const antiguaClave: string = this.formUpdateLogin.get('antiguaClave')
      ?.value as string;
    const nuevaClave: string = this.formUpdateLogin.get('nuevaClave')
      ?.value as string;

    this.authService.actualizarClave(dni, antiguaClave, nuevaClave).subscribe({
      next: (response: any) => {
        this.formUpdateLogin.reset();
        this.toastr.success(`Se actualizó correctamente.`);
      },
      error: (error: any) => {
        console.error('Error actualizando clave', error);
        this.formUpdateLogin.reset();
        this.toastr.error(
          `Error actualizando clave. Por favor, refresca la página y vuelve a intentarlo.`,
        );
      },
    });
  }
}

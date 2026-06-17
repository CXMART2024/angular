import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormularioBecasService } from '../../servicios/formulario-becas.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-form-final',
  templateUrl: './register-form-final.component.html',
  styleUrl: './register-form-final.component.css',
})
export class RegisterFormFinalComponent implements OnInit {
  fileEvidencia?: File;
  fileDni?: File;
  fileCertificado?: File;
  fileComprobante?: File;

  formData: any = {};
  isRedirecting = false;

  constructor(
    private http: HttpClient,
    private formDataService: FormularioBecasService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.formData = this.formDataService.getFormData();
    const stored = this.formDataService.getUploadedFiles();
    this.fileEvidencia = stored.evidencia;
    this.fileDni = stored.dni;
    this.fileCertificado = stored.certificado;
    this.fileComprobante = stored.comprobante;
  }

  onFileChange_evidencia_academica(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileEvidencia = input.files[0];
      this.formDataService.setUploadedFile('evidencia', this.fileEvidencia);
    }
  }

  onFileChange_dni(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileDni = input.files[0];
      this.formDataService.setUploadedFile('dni', this.fileDni);
    }
  }

  onFileChange_certifcado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileCertificado = input.files[0];
      this.formDataService.setUploadedFile('certificado', this.fileCertificado);
    }
  }

  onFileChange_comprobante(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.fileComprobante = input.files[0];
      this.formDataService.setUploadedFile('comprobante', this.fileComprobante);
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (
      !this.fileEvidencia ||
      !this.fileDni ||
      !this.fileCertificado ||
      !this.fileComprobante
    ) {
      this.toastr.warning('Por favor, suba todos los documentos requeridos.');
      return;
    }
    const formEvidencia = new FormData();
    formEvidencia.append('file', this.fileEvidencia, this.fileEvidencia.name);
    const formDni = new FormData();
    formDni.append('file', this.fileDni, this.fileDni.name);
    const formCertificado = new FormData();
    formCertificado.append(
      'file',
      this.fileCertificado,
      this.fileCertificado.name,
    );
    const formComprobante = new FormData();
    formComprobante.append(
      'file',
      this.fileComprobante,
      this.fileComprobante.name,
    );
    const cargaArchivos = [
      this.http.post(
        'https://backendbecas.azurewebsites.net/upload',
        formEvidencia,
      ),
      this.http.post('https://backendbecas.azurewebsites.net/upload', formDni),
      this.http.post(
        'https://backendbecas.azurewebsites.net/upload',
        formCertificado,
      ),
      this.http.post(
        'https://backendbecas.azurewebsites.net/upload',
        formComprobante,
      ),
    ];
    forkJoin(cargaArchivos).subscribe({
      next: (responses: any[]) => {
        this.formData.url_doc_academico = responses[0].url;
        this.formData.url_dni = responses[1].url;
        this.formData.url_certificado_estudios = responses[2].url;
        this.formData.url_comprobando_domicilio = responses[3].url;
        this.formData.EvaluacionEstado = 'Por Evaluar';
        this.formData.contratoBecario = '0';
        this.formData.fecha_solicitud = new Date();
        this.http
          .post(
            'https://backendbecas.azurewebsites.net/solicitudes/upsert',
            this.formData,
          )
          .subscribe({
            next: (response: any) => {
              if (response.value == '0') {
                alert(response.message);
                this.router.navigate(['/register-form']);
                this.formDataService.clearFormData();
              } else {
                this.notificarEnvioSolicitud(this.formData);
                this.toastr.success(`Solicitud enviada correctamente.`);
                this.router.navigate(['/register-form']);
                this.formDataService.clearFormData();
              }
            },
            error: (error) => {
              console.error('Upload error', error);
              this.toastr.error(
                `Error al enviar solicitud. Por favor, refresca la página y vuelve a intentarlo.`,
              );
            },
          });
      },
      error: (error) => {
        console.error('Error subiendo archivos', error);
        this.toastr.error(
          `Error subiendo archivos. Por favor, refresca la página y vuelve a intentarlo.`,
        );
      },
    });
  }

  backtStepFinal() {
    this.router.navigate(['register-form-next']);
  }

  goToLanding() {
    if (
      confirm(
        '¿Está seguro que desea salir? Perderá todo lo ingresado en el formulario.',
      )
    ) {
      this.isRedirecting = true;
      this.formDataService.clearFormData();
      window.location.href = 'https://fundacioncharlescrosland.org/';
    }
  }

  notificarEnvioSolicitud(solicitud: any) {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    this.http
      .post('https://603b3a18bfeaef3c8fc4a002f51b5c.e1.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c892f3fc19c0414891f907ba67d85ad7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=eFmFquQxFwg2A0ww6LybAoFc6cQ4VUU6_x5KWhuY6tM',
        /*'https://prod-09.brazilsouth.logic.azure.com:443/workflows/c892f3fc19c0414891f907ba67d85ad7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7Pfw0bnXxG_LLWwaQRb_e6aI8crlNyeO1-LT5hAzLLU',*/
        {
          Estudiante: solicitud.nombre_completo,
          CorreoEstudiante: solicitud.correo,
          FechaSolicitud: fechaFormateada,
          Institucion: solicitud.institucion_nombre,
          IngresoFamiliar: solicitud.ingreso_familiar_mensual,
          Motivo: solicitud.motivo_solicitud,
        },
      )
      .subscribe();
  }


}

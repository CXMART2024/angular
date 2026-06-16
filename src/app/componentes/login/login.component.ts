import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  siteKey: string;
  dni: string = '';
  clave: string = '';

  loginFormGroup = this.formLogin.group({
    dni: ['', Validators.required],
    clave: ['', Validators.required],
    recaptcha: ['', Validators.required],
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private formLogin: FormBuilder,
    private solicitudService: SolicitudService,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {
    this.siteKey = '6LcCAMcqAAAAABTvvMJ_tSve_MxtQBF3pFxOmJFW';
  }

  ngOnInit() {}

  onLogin() {
    this.authService.login(this.dni, this.clave).subscribe({
      next: (response: any) => {
        this.toastr.success('Ingreso exitosamente.');

        // Si es admin con permiso Contabilidad → va directo a /contabilidad, sin buscar solicitud
        if (
          response.tipo === 'admin' &&
          this.authService.tienePermiso('Contabilidad')
        ) {
          this.router.navigate(['/contabilidad']);
          return; // <-- corta aquí, no busca solicitud
        }

        // Solo llega aquí si es estudiante
        this.http
          .get(
            `https://backendbecas.azurewebsites.net/solicitudes/dni/${this.dni}`,
            {
              headers: { Authorization: `Bearer ${response.token}` },
            },
          )
          .subscribe({
            next: (solicitudData: any) => {
              this.solicitudService.setSolicitudData(solicitudData);
              if (solicitudData && solicitudData.url_doc_contrato) {
                this.router.navigate(['informacion-view']);
              } else {
                this.router.navigate(['informacion']);
              }
            },
            error: (error) => {
              console.error('Error fetching solicitud', error);
              this.toastr.error(
                'Error al obtener la información del estudiante.',
              );
            },
          });
      },
      error: (error) => {
        if (this.dni == '' || this.clave == '') {
          this.toastr.warning(
            'Por favor ingresar DNI y clave para poder ingresar.',
          );
        } else {
          this.toastr.error('El DNI y/o la clave no coinciden');
        }
      },
    });
  }
}

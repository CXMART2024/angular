import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../servicios/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
declare var bootstrap: any;

@Component({
  selector: 'app-reporte-academico',
  templateUrl: './reporte-academico.component.html',
  styleUrl: './reporte-academico.component.css'
})
export class ReporteAcademicoComponent implements OnInit {

  solicitud: any;
  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]]
  });

  constructor(private solicitudService: SolicitudService, private authService: AuthService,
    private formBuilder: FormBuilder, private toastr: ToastrService) {

  }
  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;
      if (this.solicitud) {
        this.formUpdateLogin.patchValue({
          dni: this.solicitud.dni
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

}

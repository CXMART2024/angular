import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  siteKey: string;
  dni: string = '';
  clave: string = '';

  loginFormGroup = this.formLogin.group({
    dni: ['', Validators.required],
    clave: ['', Validators.required],
    recaptcha: ['', Validators.required]
  });

  constructor(private authService: AuthService, private router: Router, private formLogin: FormBuilder, private solicitudService: SolicitudService) {
    this.siteKey = '6LcZfCsqAAAAAOq1XKb40u3iAqU6etAVZrFu8JEi';
  }

  ngOnInit() {

  }

  onLogin() {
    this.authService.login(this.dni, this.clave).subscribe({
      next: (response: any) => {
        console.log('Login successful');
        this.solicitudService.getSolicitudData().subscribe({
          next: (solicitud: any) => {
            if (solicitud && solicitud.url_doc_contrato) {
              this.router.navigate(['informacion-view']);
            } else {
              this.router.navigate(['informacion']);
            }
          },
          error: (error) => {
            console.error('Error fetching solicitud', error);
            alert('Error retrieving contract information.');
          }
        });
      },
      error: (error) => {
        if (this.dni == '' || this.clave == '') {
          alert('Por favor ingresar DNI y clave para poder ingresar.');
        } else {
          alert('El DNI y/o la clave no coinciden');
        }
      }
    });
  }

}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioBecasService } from '../../servicios/formulario-becas.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface Provincia {
  nombre: string;
  distritos: string[];
}

interface Departamento {
  nombre: string;
  provincias: Provincia[];
}

@Component({
  selector: 'app-register-form-next',
  templateUrl: './register-form-next.component.html',
  styleUrl: './register-form-next.component.css',
})
export class RegisterFormNextComponent implements OnInit {
  peruData: Departamento[] = [];
  provinciasFiltradas: string[] = [];
  distritosFiltrados: string[] = [];

  formData: any = {};
  currentStudentID = '';
  isRedirecting = false;

  registrationForm = this.fb.group({
    institucion_nombre: ['', [Validators.required, Validators.minLength(1)]],
    institucion_departamento: ['', [Validators.required]],
    ruc_institucion: ['', [Validators.required]],
    institucion_provincia: ['', [Validators.required]],
    institucion_distrito: ['', [Validators.required]],
    institucion_direccion: ['', [Validators.required]],
    tipo_educacion: ['', [Validators.required]],
    grado_academico: ['', [Validators.required]],
    promedio_academico: ['', [Validators.required]],
    motivo_solicitud: ['', [Validators.required, Validators.minLength(1)]],
    bydni: '',
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private formDataService: FormularioBecasService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    this.formData = this.formDataService.getFormData();

    this.http
      .get<Departamento[]>('assets/data/peru_data.json')
      .subscribe((data) => {
        this.peruData = data;
        setTimeout(() => {
          if (this.formData) {
            this.registrationForm.patchValue(this.formData);
            const dep = this.peruData.find(
              (d) => d.nombre === this.formData.institucion_departamento,
            );
            if (dep) {
              this.provinciasFiltradas = dep.provincias.map((p) => p.nombre);
              const prov = dep.provincias.find(
                (p) => p.nombre === this.formData.institucion_provincia,
              );
              this.distritosFiltrados = prov ? prov.distritos : [];
            }
          }
        }, 0);
      });

    this.registrationForm
      .get('institucion_departamento')
      ?.valueChanges.subscribe((depSeleccionado) => {
        const dep = this.peruData.find((d) => d.nombre === depSeleccionado);
        this.provinciasFiltradas = dep
          ? dep.provincias.map((p) => p.nombre)
          : [];
        this.distritosFiltrados = [];
        this.registrationForm.patchValue(
          { institucion_provincia: '', institucion_distrito: '' },
          { emitEvent: false },
        );
      });

    this.registrationForm
      .get('institucion_provincia')
      ?.valueChanges.subscribe((provSeleccionada) => {
        const depSeleccionado = this.registrationForm.get(
          'institucion_departamento',
        )?.value;
        const dep = this.peruData.find((d) => d.nombre === depSeleccionado);
        const prov = dep?.provincias.find((p) => p.nombre === provSeleccionada);
        this.distritosFiltrados = prov ? prov.distritos : [];
        this.registrationForm.patchValue(
          { institucion_distrito: '' },
          { emitEvent: false },
        );
      });
  }

  saveNextFields(event: Event) {
    event.preventDefault();
    const bodyData = {
      institucion_nombre: this.registrationForm.value.institucion_nombre,
      institucion_departamento:
        this.registrationForm.value.institucion_departamento,
      ruc_institucion: this.registrationForm.value.ruc_institucion,
      institucion_provincia: this.registrationForm.value.institucion_provincia,
      institucion_distrito: this.registrationForm.value.institucion_distrito,
      institucion_direccion: this.registrationForm.value.institucion_direccion,
      tipo_educacion: this.registrationForm.value.tipo_educacion,
      promedio_academico: this.registrationForm.value.promedio_academico,
      motivo_solicitud: this.registrationForm.value.motivo_solicitud,
      grado_academico: this.registrationForm.value.grado_academico,
    };
    this.formDataService.setFormData(bodyData);
    this.router.navigate(['register-form-final']);
  }

  openDialog() {}

  backtStep(event: Event) {
    event.preventDefault();
    const bodyData = {
      institucion_nombre: this.registrationForm.value.institucion_nombre,
      institucion_departamento:
        this.registrationForm.value.institucion_departamento,
      institucion_provincia: this.registrationForm.value.institucion_provincia,
      institucion_distrito: this.registrationForm.value.institucion_distrito,
      institucion_direccion: this.registrationForm.value.institucion_direccion,
      tipo_educacion: this.registrationForm.value.tipo_educacion,
      grado_academico: this.registrationForm.value.grado_academico,
      promedio_academico: this.registrationForm.value.promedio_academico,
      motivo_solicitud: this.registrationForm.value.motivo_solicitud,
    };
    this.formDataService.setFormData(bodyData);
    this.router.navigate(['register-form']);
  }

  onSubmit() {}

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

  getDni() {
    const bydni = this.registrationForm.get('bydni')?.value;
    if (!bydni) {
      this.toastr.warning(`El documento de identidad no existe`);
      return;
    }
    this.http.get(`http://localhost:3000/solicitudes/dni/${bydni}`).subscribe({
      next: (response: any) => {
        this.registrationForm.patchValue(response);
        this.toastr.success(`Se cargo sus datos exitosamente`);
      },
      error: (error) => {
        console.error('Upload error', error);
        this.toastr.error(
          `Error intente de nuevo. Por favor, refresca la página y vuelve a intentarlo.`,
        );
      },
    });
  }
}

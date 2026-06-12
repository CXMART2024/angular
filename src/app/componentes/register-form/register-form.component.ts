import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormularioBecasService } from '../../servicios/formulario-becas.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

interface Provincia {
  nombre: string;
  distritos: string[];
}

interface Departamento {
  nombre: string;
  provincias: Provincia[];
}

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
})
export class RegisterFormComponent implements OnInit {
  peruData: Departamento[] = [];
  provinciasFiltradas: string[] = [];
  distritosFiltrados: string[] = [];

  //fb = inject(FormBuilder)
  limaDistricts = [
    'Lima',
    'Ancón',
    'Ate',
    'Barranco',
    'Breña',
    'Carabayllo',
    'Chaclacayo',
    'Chorrillos',
    'Cieneguilla',
    'Comas',
    'El Agustino',
    'Independencia',
    'Jesús María',
    'La Molina',
    'La Victoria',
    'Lince',
    'Los Olivos',
    'Lurigancho-Chosica',
    'Lurín',
    'Magdalena del Mar',
    'Miraflores',
    'Pachacamac',
    'Pucusana',
    'Pueblo Libre',
    'Puente Piedra',
    'Punta Hermosa',
    'Punta Negra',
    'Rímac',
    'San Bartolo',
    'San Borja',
    'San Isidro',
    'San Juan de Lurigancho',
    'San Juan de Miraflores',
    'San Luis',
    'San Martín de Porres',
    'San Miguel',
    'Santa Anita',
    'Santa María del Mar',
    'Santa Rosa',
    'Santiago de Surco',
    'Surquillo',
    'Villa El Salvador',
    'Villa María del Triunfo',
  ];

  peruProvinces = [
    // Amazonas
    'Bagua',
    'Bongará',
    'Chachapoyas',
    'Condorcanqui',
    'Luya',
    'Rodríguez de Mendoza',
    'Utcubamba',

    // Áncash
    'Aija',
    'Antonio Raymondi',
    'Asunción',
    'Bolognesi',
    'Carhuaz',
    'Carlos Fermín Fitzcarrald',
    'Casma',
    'Corongo',
    'Huari',
    'Huarmey',
    'Huaylas',
    'Mariscal Luzuriaga',
    'Ocros',
    'Pallasca',
    'Pomabamba',
    'Recuay',
    'Santa',
    'Sihuas',
    'Yungay',

    // Apurímac
    'Abancay',
    'Andahuaylas',
    'Antabamba',
    'Aymaraes',
    'Chincheros',
    'Cotabambas',
    'Grau',

    // Arequipa
    'Arequipa',
    'Camaná',
    'Caravelí',
    'Castilla',
    'Caylloma',
    'Condesuyos',
    'Islay',
    'La Unión',

    // Ayacucho
    'Cangallo',
    'Huanca Sancos',
    'Huanta',
    'La Mar',
    'Lucanas',
    'Parinacochas',
    'Páucar del Sara Sara',
    'Sucre',
    'Víctor Fajardo',
    'Vilcas Huamán',

    // Cajamarca
    'Cajabamba',
    'Cajamarca',
    'Celendín',
    'Chota',
    'Contumazá',
    'Cutervo',
    'Hualgayoc',
    'Jaén',
    'San Ignacio',
    'San Marcos',
    'San Miguel',
    'San Pablo',
    'Santa Cruz',

    // Callao
    'Callao',

    // Cusco
    'Acomayo',
    'Anta',
    'Calca',
    'Canas',
    'Canchis',
    'Chumbivilcas',
    'Cusco',
    'Espinar',
    'La Convención',
    'Paruro',
    'Paucartambo',
    'Quispicanchi',
    'Urubamba',

    // Huancavelica
    'Acobamba',
    'Angaraes',
    'Castrovirreyna',
    'Churcampa',
    'Huancavelica',
    'Huaytará',

    // Huánuco
    'Ambo',
    'Dos de Mayo',
    'Huacaybamba',
    'Huamalíes',
    'Huanuco',
    'Lauricocha',
    'Leoncio Prado',
    'Marañón',
    'Pachitea',
    'Puerto Inca',
    'Yarowilca',

    // Ica
    'Chincha',
    'Ica',
    'Nazca',
    'Palpa',
    'Pisco',

    // Junín
    'Chanchamayo',
    'Chupaca',
    'Concepción',
    'Huancayo',
    'Jauja',
    'Junín',
    'Satipo',
    'Tarma',
    'Yauli',

    // La Libertad
    'Ascope',
    'Bolívar',
    'Chepén',
    'Gran Chimú',
    'Julcán',
    'Otuzco',
    'Pacasmayo',
    'Pataz',
    'Sánchez Carrión',
    'Santiago de Chuco',
    'Trujillo',
    'Virú',

    // Lambayeque
    'Chiclayo',
    'Ferreñafe',
    'Lambayeque',

    // Lima
    'Barranca',
    'Cajatambo',
    'Cañete',
    'Canta',
    'Huaral',
    'Huarochirí',
    'Huaura',
    'Lima',
    'Oyón',
    'Yauyos',

    // Loreto
    'Alto Amazonas',
    'Datem del Marañón',
    'Loreto',
    'Mariscal Ramón Castilla',
    'Maynas',
    'Requena',
    'Ucayali',

    // Madre de Dios
    'Manu',
    'Tahuamanu',
    'Tambopata',

    // Moquegua
    'General Sánchez Cerro',
    'Ilo',
    'Mariscal Nieto',

    // Pasco
    'Oxapampa',
    'Pasco',
    'Daniel Alcides Carrión',

    // Piura
    'Ayabaca',
    'Huancabamba',
    'Morropón',
    'Paita',
    'Piura',
    'Sechura',
    'Sullana',
    'Talara',

    // Puno
    'Azángaro',
    'Carabaya',
    'Chucuito',
    'El Collao',
    'Huancané',
    'Lampa',
    'Melgar',
    'Moho',
    'Puno',
    'San Antonio de Putina',
    'San Román',
    'Sandia',
    'Yunguyo',

    // San Martín
    'Bellavista',
    'El Dorado',
    'Huallaga',
    'Lamas',
    'Mariscal Cáceres',
    'Moyobamba',
    'Picota',
    'Rioja',
    'San Martín',
    'Tocache',

    // Tacna
    'Candarave',
    'Jorge Basadre',
    'Tacna',
    'Tarata',

    // Tumbes
    'Contralmirante Villar',
    'Tumbes',
    'Zarumilla',

    // Ucayali
    'Atalaya',
    'Coronel Portillo',
    'Padre Abad',
  ].sort((a, b) => a.localeCompare(b, 'es'));

  departamentoList = [
    'Amazonas',
    'Ancash',
    'Apurimac',
    'Arequipa',
    'Ayacucho',
    'Cajamarca',
    'Callao',
    'Cusco',
    'Huancavelica',
    'Huanuco',
    'Ica',
    'Junin',
    'La Libertad',
    'Lambayeque',
    'Lima',
    'Loreto',
    'Madre de Dios',
    'Moquegua',
    'Pasco',
    'Piura',
    'Puno',
    'San Martin',
    'Tacna',
    'Tumbes',
    'Ucayali',
  ];

  StudentArray: any[] = [];
  isResultLoaded = false;
  isUpdateFormActive = false;

  formData: any = {};

  registrationForm = this.fb.group({
    nombre_completo: ['', [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.minLength(8)]],
    celular: ['', [Validators.required]],
    codigo_estudiante: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    fecha_nacimiento: [null, [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    departamento: ['', [Validators.required]],
    provincia: ['', [Validators.required]],
    distrito: ['', [Validators.required]],
    direccion: ['', [Validators.required, Validators.minLength(1)]],
    ingreso_familiar_mensual: ['', [Validators.required]],
    apoderado_nombre: '',
    apoderado_dni: '',
    apoderado_celular: '',
    apoderado_correo: '',
    bydni: '',
  });

  currentStudentID = '';

  constructor(
    private formDataService: FormularioBecasService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.formData = this.formDataService.getFormData();

    if (this.formData) {
      this.registrationForm.patchValue(this.formData);
    }

    // Cargar el JSON
    this.http
      .get<Departamento[]>('assets/data/peru_data.json')
      .subscribe((data) => {
        this.peruData = data;
      });

    // Escuchar cambios en departamento
    this.registrationForm
      .get('departamento')
      ?.valueChanges.subscribe((depSeleccionado) => {
        const dep = this.peruData.find((d) => d.nombre === depSeleccionado);
        this.provinciasFiltradas = dep
          ? dep.provincias.map((p) => p.nombre)
          : [];
        this.distritosFiltrados = [];

        this.registrationForm.patchValue(
          {
            provincia: '',
            distrito: '',
          },
          { emitEvent: false },
        ); // evita que se disparen valueChanges en cascada al resetear
      });

    // Escuchar cambios en provincia
    this.registrationForm
      .get('provincia')
      ?.valueChanges.subscribe((provSeleccionada) => {
        const depSeleccionado =
          this.registrationForm.get('departamento')?.value;
        const dep = this.peruData.find((d) => d.nombre === depSeleccionado);
        const prov = dep?.provincias.find((p) => p.nombre === provSeleccionada);

        this.distritosFiltrados = prov ? prov.distritos : [];

        this.registrationForm.patchValue(
          {
            distrito: '',
          },
          { emitEvent: false },
        );
      });
  }

  openDialog() {}

  debugForm() {
    console.log('FORM VALID:', this.registrationForm.valid);
    console.log('FORM STATUS:', this.registrationForm.status);

    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);

      if (control?.invalid) {
        console.log('-------------------');
        console.log('Campo inválido:', key);
        console.log('Valor:', control.value);
        console.log('Errores:', control.errors);
      }
    });
  }

  openNextStep() {
    this.router.navigate(['nextstep']);
  }

  saveInitialFields(event: Event) {
    event.preventDefault();

    let bodyData = {
      nombre_completo: this.registrationForm.value.nombre_completo,
      dni: this.registrationForm.value.dni,
      celular: this.registrationForm.value.celular,
      genero: this.registrationForm.value.genero,
      fecha_nacimiento: this.registrationForm.value.fecha_nacimiento,
      correo: this.registrationForm.value.correo,
      departamento: this.registrationForm.value.departamento,
      provincia: this.registrationForm.value.provincia,
      distrito: this.registrationForm.value.distrito,
      direccion: this.registrationForm.value.direccion,
      ingreso_familiar_mensual:
        this.registrationForm.value.ingreso_familiar_mensual,
      apoderado_nombre: this.registrationForm.value.apoderado_nombre,
      apoderado_dni: this.registrationForm.value.apoderado_dni,
      apoderado_celular: this.registrationForm.value.apoderado_celular,
      apoderado_correo: this.registrationForm.value.apoderado_correo,
    };
    this.formDataService.setFormData(bodyData);

    this.router.navigate(['register-form-next']);
  }

  onSubmit() {}

  getDni() {
    const bydni = this.registrationForm.get('bydni')?.value;

    if (!bydni) {
      this.toastr.warning(`El documento de identidad no existe`);
      return;
    }

    this.http
      .get(`https://backendbecas.azurewebsites.net/solicitudes/dni/${bydni}`)
      .subscribe({
        next: (response: any) => {
          if (response.fecha_nacimiento) {
            response.fecha_nacimiento = this.formatDateForInput(
              response.fecha_nacimiento,
            );
          }

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

  formatDateForInput(dateString: string): string {
    return moment.utc(dateString).format('YYYY-MM-DD');
  }

  goToLanding() {
    if (
      confirm(
        '¿Está seguro que desea salir? Perderá todo lo ingresado en el formulario.',
      )
    ) {
      this.formDataService.clearFormData();
      window.location.href = 'https://fundacioncharlescrosland.org/';
    }
  }

  formatDate(inputDate: string | null | undefined): string {
    if (!inputDate) return '';

    const date = new Date(inputDate);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
}

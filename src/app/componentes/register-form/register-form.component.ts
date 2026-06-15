import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormularioBecasService } from '../../servicios/formulario-becas.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent implements OnInit {

  limaDistricts = [
    'Lima', 'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla',
    'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos',
    'Lurigancho-Chosica', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacamac', 'Pucusana', 'Pueblo Libre',
    'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar',
    'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ];

  peruProvinces = [
    'Bagua', 'Bongará', 'Chachapoyas', 'Condorcanqui', 'Luya', 'Rodríguez de Mendoza', 'Utcubamba',
    'Aija', 'Antonio Raymondi', 'Asunción', 'Bolognesi', 'Carhuaz', 'Carlos Fermín Fitzcarrald', 'Casma',
    'Corongo', 'Huari', 'Huarmey', 'Huaylas', 'Mariscal Luzuriaga', 'Ocros', 'Pallasca', 'Pomabamba',
    'Recuay', 'Santa', 'Sihuas', 'Yungay',
    'Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Chincheros', 'Cotabambas', 'Grau',
    'Arequipa', 'Camaná', 'Caravelí', 'Castilla', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión',
    'Cangallo', 'Huanca Sancos', 'Huanta', 'La Mar', 'Lucanas', 'Parinacochas', 'Páucar del Sara Sara',
    'Sucre', 'Víctor Fajardo', 'Vilcas Huamán',
    'Cajabamba', 'Cajamarca', 'Celendín', 'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén',
    'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz',
    'Callao',
    'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Cusco', 'Espinar', 'La Convención',
    'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba',
    'Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huancavelica', 'Huaytará',
    'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Huanuco', 'Lauricocha', 'Leoncio Prado',
    'Marañón', 'Pachitea', 'Puerto Inca', 'Yarowilca',
    'Chincha', 'Ica', 'Nazca', 'Palpa', 'Pisco',
    'Chanchamayo', 'Chupaca', 'Concepción', 'Huancayo', 'Jauja', 'Junín', 'Satipo', 'Tarma', 'Yauli',
    'Ascope', 'Bolívar', 'Chepén', 'Gran Chimú', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz',
    'Sánchez Carrión', 'Santiago de Chuco', 'Trujillo', 'Virú',
    'Chiclayo', 'Ferreñafe', 'Lambayeque',
    'Barranca', 'Cajatambo', 'Cañete', 'Canta', 'Huaral', 'Huarochirí', 'Huaura', 'Lima', 'Oyón', 'Yauyos',
    'Alto Amazonas', 'Datem del Marañón', 'Loreto', 'Mariscal Ramón Castilla', 'Maynas', 'Requena', 'Ucayali',
    'Manu', 'Tahuamanu', 'Tambopata',
    'General Sánchez Cerro', 'Ilo', 'Mariscal Nieto',
    'Oxapampa', 'Pasco', 'Daniel Alcides Carrión',
    'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Piura', 'Sechura', 'Sullana', 'Talara',
    'Azángaro', 'Carabaya', 'Chucuito', 'El Collao', 'Huancané', 'Lampa', 'Melgar', 'Moho', 'Puno',
    'San Antonio de Putina', 'San Román', 'Sandia', 'Yunguyo',
    'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Moyobamba', 'Picota', 'Rioja',
    'San Martín', 'Tocache',
    'Candarave', 'Jorge Basadre', 'Tacna', 'Tarata',
    'Contralmirante Villar', 'Tumbes', 'Zarumilla',
    'Atalaya', 'Coronel Portillo', 'Padre Abad'
  ].sort((a, b) => a.localeCompare(b, 'es'));

  departamentoList = [
    'Amazonas', 'Ancash', 'Apurimac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco',
    'Huancavelica', 'Huanuco', 'Ica', 'Junin', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto',
    'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martin', 'Tacna', 'Tumbes', 'Ucayali'
  ];

  isRedirecting = false;
  formData: any = {};

  registrationForm = this.fb.group({
    nombre_completo: ["", [Validators.required, Validators.minLength(3)]],
    dni: ['', [Validators.required, Validators.minLength(8)]],
    celular: ['', [Validators.required]],
    genero: ["", [Validators.required]],
    fecha_nacimiento: [null, [Validators.required]],
    correo: ["", [Validators.required, Validators.email]],
    departamento: ["", [Validators.required]],
    provincia: ["", [Validators.required]],
    distrito: ["", [Validators.required]],
    direccion: ["", [Validators.required, Validators.minLength(1)]],
    ingreso_familiar_mensual: ['', [Validators.required]],
    apoderado_nombre: '',
    apoderado_dni: '',
    apoderado_celular: '',
    apoderado_correo: '',
    bydni: ''
  });

  constructor(private formDataService: FormularioBecasService, private router: Router, private fb: FormBuilder, private http: HttpClient, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.formData = this.formDataService.getFormData();

    if (this.formData) {
      // Defer patchValue so *ngFor options render before matching select values
      setTimeout(() => {
        this.registrationForm.patchValue(this.formData);
        this.formatIngresoDisplay();
        this.updateApoderadoValidators();
      }, 0);
    }

    this.registrationForm.get('fecha_nacimiento')?.valueChanges.subscribe(() => {
      this.updateApoderadoValidators();
    });
  }

  // --- Getters ---

  get esMenorDeEdad(): boolean {
    const fechaStr = this.registrationForm.get('fecha_nacimiento')?.value;
    if (!fechaStr) return false;
    const hoy = new Date();
    const nacimiento = new Date(fechaStr + 'T00:00:00');
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad < 18;
  }

  // Max date: must be at least 5 years old (also blocks future dates)
  get maxFechaNacimiento(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 5);
    return d.toISOString().split('T')[0];
  }

  // --- Validators dinámicos para apoderado ---

  updateApoderadoValidators() {
    const apoderadoFields: Record<string, any[]> = {
      apoderado_nombre: [Validators.required],
      apoderado_dni: [Validators.required],
      apoderado_celular: [Validators.required],
      apoderado_correo: [Validators.required, Validators.email]
    };

    if (this.esMenorDeEdad) {
      Object.entries(apoderadoFields).forEach(([field, validators]) => {
        this.registrationForm.get(field)?.setValidators(validators);
        this.registrationForm.get(field)?.updateValueAndValidity();
      });
    } else {
      Object.keys(apoderadoFields).forEach(field => {
        this.registrationForm.get(field)?.clearValidators();
        this.registrationForm.get(field)?.updateValueAndValidity();
      });
    }
  }

  // --- Input handlers ---

  onlyNumbers(event: KeyboardEvent): boolean {
    return /[0-9]/.test(event.key);
  }

  formatCurrency(event: Event) {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) parts[1] = parts[1].substring(0, 2);
    const formatted = parts.join('.');
    input.value = formatted;
    this.registrationForm.get('ingreso_familiar_mensual')?.setValue(
      formatted.replace(/,/g, ''), { emitEvent: false }
    );
  }

  formatIngresoDisplay() {
    const raw = this.registrationForm.get('ingreso_familiar_mensual')?.value;
    if (raw) {
      const num = parseFloat(String(raw).replace(/,/g, ''));
      if (!isNaN(num)) {
        const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        this.registrationForm.get('ingreso_familiar_mensual')?.setValue(formatted, { emitEvent: false });
      }
    }
  }

  // --- Navigation ---

  saveInitialFields(event: Event) {
    event.preventDefault();

    const bodyData = {
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
      ingreso_familiar_mensual: String(this.registrationForm.value.ingreso_familiar_mensual).replace(/,/g, ''),
      apoderado_nombre: this.registrationForm.value.apoderado_nombre,
      apoderado_dni: this.registrationForm.value.apoderado_dni,
      apoderado_celular: this.registrationForm.value.apoderado_celular,
      apoderado_correo: this.registrationForm.value.apoderado_correo
    };

    this.formDataService.setFormData(bodyData);
    this.router.navigate(['register-form-next']);
  }

  onSubmit() { }

  getDni() {
    const bydni = this.registrationForm.get('bydni')?.value;
    if (!bydni) {
      this.toastr.warning(`El documento de identidad no existe`);
      return;
    }
    this.http.get(`https://backendbecas.azurewebsites.net/solicitudes/dni/${bydni}`).subscribe({
      next: (response: any) => {
        if (response.fecha_nacimiento) {
          response.fecha_nacimiento = this.formatDateForInput(response.fecha_nacimiento);
        }
        this.registrationForm.patchValue(response);
        this.formatIngresoDisplay();
        this.toastr.success(`Se cargo sus datos exitosamente`);
      },
      error: (error) => {
        console.error('Upload error', error);
        this.toastr.error(`Error intente de nuevo. Por favor, refresca la página y vuelve a intentarlo.`);
      }
    });
  }

  formatDateForInput(dateString: string): string {
    return moment.utc(dateString).format('YYYY-MM-DD');
  }

  goToLanding() {
    if (confirm('¿Está seguro que desea salir? Perderá todo lo ingresado en el formulario.')) {
      this.isRedirecting = true;
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

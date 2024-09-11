import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioBecasService } from '../../servicios/formulario-becas.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-form-next',
  templateUrl: './register-form-next.component.html',
  styleUrl: './register-form-next.component.css'
})
export class RegisterFormNextComponent implements OnInit {
  limaDistricts = [
    'Lima', 'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla',
    'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos',
    'Lurigancho-Chosica', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacamac', 'Pucusana', 'Pueblo Libre',
    'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho',
    'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar',
    'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ];

  peruProvinces = [
    // Amazonas
    'Bagua', 'Bongará', 'Chachapoyas', 'Condorcanqui', 'Luya', 'Rodríguez de Mendoza', 'Utcubamba',

    // Áncash
    'Aija', 'Antonio Raymondi', 'Asunción', 'Bolognesi', 'Carhuaz', 'Carlos Fermín Fitzcarrald', 'Casma',
    'Corongo', 'Huari', 'Huarmey', 'Huaylas', 'Mariscal Luzuriaga', 'Ocros', 'Pallasca', 'Pomabamba',
    'Recuay', 'Santa', 'Sihuas', 'Yungay',

    // Apurímac
    'Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Chincheros', 'Cotabambas', 'Grau',

    // Arequipa
    'Arequipa', 'Camaná', 'Caravelí', 'Castilla', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión',

    // Ayacucho
    'Cangallo', 'Huanca Sancos', 'Huanta', 'La Mar', 'Lucanas', 'Parinacochas', 'Páucar del Sara Sara',
    'Sucre', 'Víctor Fajardo', 'Vilcas Huamán',

    // Cajamarca
    'Cajabamba', 'Cajamarca', 'Celendín', 'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén',
    'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz',

    // Callao
    'Callao',

    // Cusco
    'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Cusco', 'Espinar', 'La Convención',
    'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba',

    // Huancavelica
    'Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huancavelica', 'Huaytará',

    // Huánuco
    'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Huanuco', 'Lauricocha', 'Leoncio Prado',
    'Marañón', 'Pachitea', 'Puerto Inca', 'Yarowilca',

    // Ica
    'Chincha', 'Ica', 'Nazca', 'Palpa', 'Pisco',

    // Junín
    'Chanchamayo', 'Chupaca', 'Concepción', 'Huancayo', 'Jauja', 'Junín', 'Satipo', 'Tarma', 'Yauli',

    // La Libertad
    'Ascope', 'Bolívar', 'Chepén', 'Gran Chimú', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz',
    'Sánchez Carrión', 'Santiago de Chuco', 'Trujillo', 'Virú',

    // Lambayeque
    'Chiclayo', 'Ferreñafe', 'Lambayeque',

    // Lima
    'Barranca', 'Cajatambo', 'Cañete', 'Canta', 'Huaral', 'Huarochirí', 'Huaura', 'Lima', 'Oyón', 'Yauyos',

    // Loreto
    'Alto Amazonas', 'Datem del Marañón', 'Loreto', 'Mariscal Ramón Castilla', 'Maynas', 'Requena', 'Ucayali',

    // Madre de Dios
    'Manu', 'Tahuamanu', 'Tambopata',

    // Moquegua
    'General Sánchez Cerro', 'Ilo', 'Mariscal Nieto',

    // Pasco
    'Oxapampa', 'Pasco', 'Daniel Alcides Carrión',

    // Piura
    'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Piura', 'Sechura', 'Sullana', 'Talara',

    // Puno
    'Azángaro', 'Carabaya', 'Chucuito', 'El Collao', 'Huancané', 'Lampa', 'Melgar', 'Moho', 'Puno',
    'San Antonio de Putina', 'San Román', 'Sandia', 'Yunguyo',

    // San Martín
    'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Moyobamba', 'Picota', 'Rioja',
    'San Martín', 'Tocache',

    // Tacna
    'Candarave', 'Jorge Basadre', 'Tacna', 'Tarata',

    // Tumbes
    'Contralmirante Villar', 'Tumbes', 'Zarumilla',

    // Ucayali
    'Atalaya', 'Coronel Portillo', 'Padre Abad'
  ];

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
    'Ucayali'
  ];

  formData: any = {};
  currentStudentID = "";

  registrationForm = this.fb.group({
    institucion_nombre: ["", [Validators.required, Validators.minLength(1)]],
    institucion_departamento: ["", [Validators.required]],
    institucion_provincia: ["", [Validators.required]],
    institucion_distrito: ["", [Validators.required]],
    institucion_direccion: ["", [Validators.required]],
    tipo_educacion: ["", [Validators.required]],
    promedio_academico: ['', [Validators.required]],
    motivo_solicitud: ["", [Validators.required, Validators.minLength(1)]],
    bydni: ''
  });

  constructor(private http: HttpClient, private router: Router, private formDataService: FormularioBecasService, private fb: FormBuilder,private toastr: ToastrService) { }

  ngOnInit() {
    this.formData = this.formDataService.getFormData();
  }


  saveNextFields(event: Event) {
    event.preventDefault();

    let bodyData = {
      "institucion_nombre": this.registrationForm.value.institucion_nombre,
      "institucion_departamento": this.registrationForm.value.institucion_departamento,
      "institucion_provincia": this.registrationForm.value.institucion_provincia,
      "institucion_distrito": this.registrationForm.value.institucion_distrito,
      "institucion_direccion": this.registrationForm.value.institucion_direccion,
      "tipo_educacion": this.registrationForm.value.tipo_educacion,
      "promedio_academico": this.registrationForm.value.promedio_academico,
      "motivo_solicitud": this.registrationForm.value.motivo_solicitud
    };
    this.formDataService.setFormData(bodyData);
    this.router.navigate(['register-form-final'])
  }

  /*
  setUpdate(data: any) {
    this.PASATIEMPO = data.PASATIEMPO,
    this.BUDGET= data.BUDGET
    this.currentStudentID = data.ID;
    this.formDataService.setFormData(data); // Save the data to the service
    
    }*/


  openDialog() {
    /*this.dialogRef.open(SubsanacionPopupComponent,{
    width: '400px', height: '295px' // Prevent closing when clicking outside - disableClose: true
      })*/
  }

  backtStep() {
    this.router.navigate(['register-form']);
    this.formDataService.clearFormData();
  }

  onSubmit() {
    
  }


  getDni() {

    const bydni = this.registrationForm.get('bydni')?.value;

    if (!bydni) {
      this.toastr.warning(`El documento de identidad no existe`);
      return;
    }

    this.http.get(`https://backendbecas.azurewebsites.net/solicitudes/dni/${bydni}`).subscribe({
      next: (response: any) => {
        
        this.registrationForm.patchValue(response);
        this.toastr.success(`Se cargo sus datos exitosamente`);
      },
      error: (error) => {
        console.error('Upload error', error);
        this.toastr.error(`Error intente de nuevo. Por favor, refresca la página y vuelve a intentarlo.`);
      }
    });
  }


}

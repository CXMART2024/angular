import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { firstValueFrom, forkJoin, map, Observable } from 'rxjs';
import { format } from 'date-fns';
import moment from 'moment';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { CursoMalla } from '../../modelos/curso-malla';
import { RelacionMalla } from '../../modelos/relacion-malla';
import { Ciclo } from '../../modelos/ciclo';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../servicios/auth/auth.service';

@Component({
  selector: 'app-informacion-beca',
  templateUrl: './informacion-beca.component.html',
  styleUrl: './informacion-beca.component.css',
})
export class InformacionBecaComponent implements OnInit {
  solicitud: any;
  contratoNombre: string = '';
  mallaNombre: string = '';
  isChecked: boolean = false;
  ciclosMallaLista?: CicloMalla[];
  cursoMallaLista?: CursoMalla[];
  cicloCursoRelacion: RelacionMalla[] = [];
  selectedCicloId?: number;
  url_foto_estudiante = new FormData();
  url_doc_contrato = new FormData();
  id_malla_curricular = new FormData();
  contratoEsNuevo: boolean = false;
  // Agregar estas variables
  url_con_intranet = new FormData();
  contratoIntranetNombre: string = '';
  contratoIntranetEsNuevo: boolean = false;
  mallaEsNueva: boolean = false;
  fotoEsNueva: boolean = false;
  fotoPreview: string =
    'https://mdbootstrap.com/img/Photos/Others/placeholder-avatar.jpg';
  fotoNombre: string = '';

  editMallaCurricular: boolean = true;
  nombre_completo: string = '';
  dni: string = '';
  institucion_nombre: string = '';
  fecha_inicio: string = '';
  fecha_fin_estimada: string = '';
  codigo_estudiante: string = '';
  ruc_institucion: string = '';
  formUpdateLogin = this.formBuilder.group({
    dni: ['', [Validators.required]],
    antiguaClave: ['', [Validators.required]],
    nuevaClave: ['', [Validators.required]],
  });

  //Variables para agregar Malla

  newCursoMalla: CursoMalla = new CursoMalla(0, '', 0, 0, '');
  editingIndex: number | null = null;
  nombre: string = '';

  //Variablas para editar Malla
  cicloId: number = 0;
  editingIndexEdit: number | null = null;
  relacionMallaData: CicloMalla[] = [];
  cursos: CursoMalla[] = [];
  newCursoMallaEdit: CursoMalla = new CursoMalla(0, '', 0, 0, '');
  fechaFinInvalid: boolean = false;

  constructor(
    private solicitudService: SolicitudService,
    private http: HttpClient,
    private mallaCurricularService: MallaCurricularService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.url_con_intranet = new FormData();
    this.contratoIntranetNombre = '';

    this.cargarDatosSolicitud();

    this.cdr.detectChanges();
  }

  cargarDatosSolicitud(): void {
    this.solicitudService.getSolicitudData().subscribe((data) => {
      this.solicitud = data;

      console.log('👤 Usuario logueado:', this.solicitud);

      if (this.solicitud) {
        if (this.solicitud.contratoBecario == '0') {
          this.showModal();
        }

        this.editMallaCurricular =
          this.solicitud.MallaEstado == 'No Cargado' ||
          this.solicitud.MallaEstado == 'Observado';
        this.nombre_completo = this.solicitud.nombre_completo;
        this.codigo_estudiante = this.solicitud.codigo_estudiante;
        this.ruc_institucion = this.solicitud.ruc_institucion;

        if (this.solicitud.url_foto_estudiante) {
          this.fotoPreview = this.solicitud.url_foto_estudiante;
          this.fotoNombre =
            this.solicitud.url_foto_estudiante.split('/').pop() || '';
          const blob = new Blob([''], { type: 'image/jpeg' });
          const fakeFile = new File([blob], this.fotoNombre, {
            type: 'image/jpeg',
          });
          this.url_foto_estudiante = new FormData();
          this.url_foto_estudiante.append('file', fakeFile, this.fotoNombre);
        }

        this.dni = this.solicitud.dni;
        this.institucion_nombre = this.solicitud.institucion_nombre;
        this.fecha_inicio = this.formatDateForInput(
          this.solicitud.fecha_inicio,
        );
        this.fecha_fin_estimada = this.formatDateForInput(
          this.solicitud.fecha_fin_estimada,
        );

        this.getMallaCiclos();
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            this.getMallaCiclos();
          }
        });

        const savedFormData = localStorage.getItem('formularioDatos');
        if (savedFormData) {
          const formData = JSON.parse(savedFormData);
          this.fecha_inicio = formData.fecha_inicio;
          this.fecha_fin_estimada = formData.fecha_fin_estimada;
        }

        if (this.solicitud.id_malla_curricular) {
          this.mallaNombre =
            this.solicitud.id_malla_curricular.split('/').pop() || '';
          const blob = new Blob([''], { type: 'application/pdf' });
          const fakeFile = new File([blob], this.mallaNombre, {
            type: 'application/pdf',
          });
          this.id_malla_curricular = new FormData();
          this.id_malla_curricular.append('file', fakeFile, this.mallaNombre);
        }

        if (this.solicitud.url_doc_contrato) {
          this.contratoNombre =
            this.solicitud.url_doc_contrato.split('/').pop() || '';
          const blob = new Blob([''], { type: 'application/pdf' });
          const fakeFile = new File([blob], this.contratoNombre, {
            type: 'application/pdf',
          });
          this.url_doc_contrato = new FormData();
          this.url_doc_contrato.append('file', fakeFile, this.contratoNombre);
        }

        if (this.solicitud.url_con_intranet) {
          this.contratoIntranetNombre =
            this.solicitud.url_con_intranet.split('/').pop() || '';
          const blob = new Blob([''], { type: 'application/pdf' });
          const fakeFile = new File([blob], this.contratoIntranetNombre, {
            type: 'application/pdf',
          });
          this.url_con_intranet = new FormData();
          this.url_con_intranet.append(
            'file',
            fakeFile,
            this.contratoIntranetNombre,
          );
        }
        this.cdr.detectChanges();
        this.formUpdateLogin.patchValue({ dni: this.solicitud.dni });
      }
    });
  }

  showModal() {
    setTimeout(() => {
      const modalElement = document.getElementById('contrato_becario');
      if (modalElement && (window as any).bootstrap) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 0);
  }

  // Method to update checkbox status
  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isChecked = input.checked;
  }

  onFileChange_url_foto_estudiante(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url_foto_estudiante = new FormData();
      this.url_foto_estudiante.append('file', file, file.name);
      this.fotoEsNueva = true;

      // Preview local
      this.fotoNombre = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
        this.cdr.detectChanges(); // ya tienes cdr inyectado, lo usamos
      };
      reader.readAsDataURL(file);
    }
  }

  onFileChange_url_con_intranet(event: Event) {
    console.log('INtranet entró');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url_con_intranet = new FormData();
      this.url_con_intranet.append('file', file, file.name);
      this.contratoIntranetNombre = file.name;
      this.contratoIntranetEsNuevo = true;
      this.cdr.detectChanges(); // <-- esto hace que el nombre aparezca en el modal
    }
  }

  onFileChange_id_malla_curricular(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.id_malla_curricular = new FormData();
      const file = input.files[0];
      this.id_malla_curricular.append('file', file, file.name);
      this.mallaNombre = file.name;
      this.mallaEsNueva = true;
    }
  }

  onFileChange_contratoBecario(event: Event) {
    console.log('INtranet entró contrato becario');

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.url_doc_contrato = new FormData();
      this.url_doc_contrato.append('file', file, file.name);
      this.contratoNombre = file.name;
      this.contratoEsNuevo = true;
      console.log('este es el contrato', this.url_doc_contrato);
    }
  }

  updateInformacionBecario() {
    const cargaArchivos: Observable<any>[] = [];

    // El orden aquí debe coincidir exactamente con el orden de asignación abajo
    if (this.url_foto_estudiante.has('file') && this.fotoEsNueva) {
      cargaArchivos.push(
        this.http.post(
          'https://backendbecas.azurewebsites.net/upload',
          this.url_foto_estudiante,
        ),
      );
    }

    if (this.id_malla_curricular.has('file') && this.mallaEsNueva) {
      cargaArchivos.push(
        this.http.post(
          'https://backendbecas.azurewebsites.net/upload',
          this.id_malla_curricular,
        ),
      );
    }

    if (this.url_doc_contrato.has('file') && this.contratoEsNuevo) {
      cargaArchivos.push(
        this.http.post(
          'https://backendbecas.azurewebsites.net/upload',
          this.url_doc_contrato,
        ),
      );
    }

    if (this.url_con_intranet.has('file') && this.contratoIntranetEsNuevo) {
      cargaArchivos.push(
        this.http.post(
          'https://backendbecas.azurewebsites.net/upload',
          this.url_con_intranet,
        ),
      );
    }

    this.solicitud.MallaEstado = this.editMallaCurricular
      ? 'Por Revisar'
      : this.solicitud.MallaEstado;

    if (cargaArchivos.length > 0) {
      forkJoin(cargaArchivos).subscribe({
        next: (responses: any[]) => {
          let index = 0;

          // El orden aquí debe ser EXACTAMENTE el mismo que arriba
          if (this.url_foto_estudiante.has('file') && this.fotoEsNueva) {
            this.solicitud.url_foto_estudiante = responses[index++].url;
          }
          if (this.id_malla_curricular.has('file') && this.mallaEsNueva) {
            this.solicitud.id_malla_curricular = responses[index++].url;
          }
          if (this.url_doc_contrato.has('file') && this.contratoEsNuevo) {
            this.solicitud.url_doc_contrato = responses[index++].url;
          }
          if (
            this.url_con_intranet.has('file') &&
            this.contratoIntranetEsNuevo
          ) {
            this.solicitud.url_con_intranet = responses[index++].url;
          }

          this.solicitud.fecha_inicio = this.fecha_inicio;
          this.solicitud.fecha_fin_estimada = this.fecha_fin_estimada;
          this.solicitud.codigo_estudiante = this.codigo_estudiante;
          this.solicitud.ruc_institucion = this.ruc_institucion;

          this.solicitudService.updateSolicitud(this.solicitud).subscribe({
            next: (response: any) => {
              this.solicitudService.setSolicitudData(response);
              this.toastr.success(`Se actualizó correctamente.`);
              this.cdr.detectChanges();
            },
            error: (error: any) => {
              console.error('Error al actualizar información', error);
              this.toastr.error(
                `Error al actualizar información. Por favor, refresca la página y vuelve a intentarlo.`,
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
    } else {
      this.solicitud.fecha_inicio = this.fecha_inicio;
      this.solicitud.fecha_fin_estimada = this.fecha_fin_estimada;
      this.solicitud.codigo_estudiante = this.codigo_estudiante;
      this.solicitud.ruc_institucion = this.ruc_institucion;

      this.solicitudService.updateSolicitud(this.solicitud).subscribe({
        next: (response: any) => {
          this.solicitudService.setSolicitudData(response);
          this.toastr.success(`Se actualizó correctamente.`);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error al actualizar información', error);
          this.toastr.error(
            `Error al actualizar información. Por favor, refresca la página y vuelve a intentarlo.`,
          );
        },
      });
    }
  }

  submitForm() {
    if (this.fecha_inicio && this.fecha_fin_estimada) {
      const esPrimerGuardado = this.solicitud.informacionGuardada !== '1';
      // Marcamos el flag antes de guardar para que se persista en esta misma
      // actualización. A partir de aquí el sidebar redirige a /informacion-view.
      this.solicitud.informacionGuardada = '1';
      this.updateInformacionBecario();
      // La notificación de envío de malla solo se manda la primera vez.
      if (esPrimerGuardado) {
        this.notificarEnvioMalla(this.solicitud);
      }
      this.router.navigate(['/informacion-view']);
      localStorage.removeItem('formularioDatos');
    } else {
      this.toastr.error(
        `Por favor, selecciona una fecha de inicio y una fecha estimada.`,
      );
    }
  }

  formatDateForInput(dateString: string): string {
    return moment.utc(dateString).format('YYYY-MM-DD');
  }

  getMallaCiclos() {
    if (this.solicitud && this.solicitud.id) {
      this.mallaCurricularService
        .getCiclosMallaBySolicitud(this.solicitud.id)
        .subscribe({
          next: (ciclos: CicloMalla[]) => {
            this.ciclosMallaLista = ciclos;
            this.fetchCursosForCiclos(ciclos);
          },
          error: (error) => {
            console.error('Error fetching ciclos', error);
          },
        });
    } else {
      console.error('id_solicitud is undefined or not available');
    }
  }

  fetchCursosForCiclos(ciclos: CicloMalla[]) {
    if (ciclos.length === 0) {
      return;
    }

    const cursoRequests = ciclos.map((ciclo) =>
      this.mallaCurricularService
        .getCursoMallaByCiclo(ciclo.id)
        .pipe(map((cursos) => ({ ciclo, cursos }))),
    );

    forkJoin(cursoRequests).subscribe({
      next: (cicloCursoPairs: RelacionMalla[]) => {
        this.cicloCursoRelacion = cicloCursoPairs;
      },
      error: (error) => {
        console.error('Error fetching cursos', error);
      },
    });
  }

  deleteCicloAll(ciclo: CicloMalla): void {
    if (
      confirm(`¿Estás seguro de que deseas eliminar el ciclo ${ciclo.nombre}?`)
    ) {
      const deleteCursoMalla$ =
        this.mallaCurricularService.deleteCursoMallaByCiclo(ciclo.id);
      const deleteCicloMalla$ =
        this.mallaCurricularService.deleteCicloMalla(ciclo);

      forkJoin([deleteCursoMalla$, deleteCicloMalla$]).subscribe({
        next: ([cursoResponse, cicloResponse]) => {
          this.getCursoMallas();
          this.getMallaCiclos();

          this.cicloCursoRelacion = this.cicloCursoRelacion.filter(
            (item) => item.ciclo.id !== ciclo.id,
          );

          console.log(
            'Successfully deleted curso and ciclo:',
            cursoResponse,
            cicloResponse,
          );
          this.toastr.success(`Se eliminó correctamente.`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error during deletion process:', err);
          alert('Error al eliminar el ciclo o sus cursos.');
        },
      });
    }
  }

  //Captura del ID para Editar
  selectCiclo(id: number): void {
    this.selectedCicloId = id;

    this.navigateToEditMallaCursos();
  }

  navigateToEditMallaCursos(): void {
    if (this.selectedCicloId !== null) {
      this.router.navigate(['/informacion', this.selectedCicloId]);
    } else {
      console.error('No Ciclo ID selected');
    }
  }

  clearData() {
    this.guardarDatosForm();
    this.nombre = ''; //validar
    return this.mallaCurricularService.clearCursoMallasTemporal();
  }

  // aceptarContrato() {
  //   console.log('Solicitud antes:', this.solicitud);
  //   if (this.solicitud) {
  //     this.solicitud.contratoBecario = '1';
  //     this.solicitudService.updateSolicitud(this.solicitud).subscribe({
  //       next: (response: any) => {
  //         const modalElement = document.getElementById('contrato_becario');
  //         if (modalElement && (window as any).bootstrap) {
  //           const modal = (window as any).bootstrap.Modal.getInstance(
  //             modalElement,
  //           );
  //           if (modal) {
  //             modal.hide();
  //           }
  //         }
  //         setTimeout(() => {
  //           const backdropElements =
  //             document.querySelectorAll('.modal-backdrop');
  //           backdropElements.forEach((backdrop) => backdrop.remove());
  //           this.solicitudService.setSolicitudData(response);
  //         }, 200);
  //       },
  //     });
  //     console.log('Solicitud despues:', this.solicitud);
  //   }
  // }

  aceptarContrato() {
    if (this.solicitud) {
      this.solicitud.contratoBecario = '1';

      if (this.url_con_intranet.has('file') && this.contratoIntranetEsNuevo) {
        this.http
          .post(
            'https://backendbecas.azurewebsites.net/upload',
            this.url_con_intranet,
          )
          .subscribe({
            next: (response: any) => {
              this.solicitud.url_con_intranet = response.url;

              this.solicitudService.updateSolicitud(this.solicitud).subscribe({
                next: (response: any) => {
                  this.cerrarModalContrato();
                  this.solicitudService.setSolicitudData(response);
                  this.cargarDatosSolicitud();
                },
                error: (error: any) => {
                  console.error('Error actualizando solicitud', error);
                  this.toastr.error(
                    'Error al guardar el contrato. Por favor intenta de nuevo.',
                  );
                },
              });
            },
            error: (error: any) => {
              console.error('Error subiendo contrato intranet', error);
              this.toastr.error(
                'Error al subir el archivo. Por favor intenta de nuevo.',
              );
            },
          });
      } else {
        this.solicitudService.updateSolicitud(this.solicitud).subscribe({
          next: (response: any) => {
            this.cerrarModalContrato();
            this.solicitudService.setSolicitudData(response);
            this.cargarDatosSolicitud();
          },
          error: (error: any) => {
            console.error('Error actualizando solicitud', error);
            this.toastr.error('Error al guardar. Por favor intenta de nuevo.');
          },
        });
      }
    }
  }

  // Extraemos el cierre del modal a un método aparte para no repetirlo
  private cerrarModalContrato() {
    const modalElement = document.getElementById('contrato_becario');
    if (modalElement && (window as any).bootstrap) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove());
    }, 200);
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

  guardarDatosForm() {
    const formData = {
      fecha_inicio: this.fecha_inicio,
      fecha_fin_estimada: this.fecha_fin_estimada,
    };
    localStorage.setItem('formularioDatos', JSON.stringify(formData));
  }

  isFileSelected(): boolean {
    return (
      this.url_foto_estudiante.has('file') &&
      this.url_doc_contrato.has('file') &&
      this.id_malla_curricular.has('file') &&
      this.url_con_intranet.has('file')
    );
  }

  //Funciones para agregar Malla

  prepararNuevoCurso() {
    this.editingIndex = null;
    this.newCursoMalla = new CursoMalla(0, '', 0, 0, '');
  }

  saveCursoMalla() {
    if (this.editingIndex !== null) {
      // Actualizamos
      this.mallaCurricularService.updateCursoMallaTemporal(
        this.editingIndex,
        this.newCursoMalla,
      );
      this.editingIndex = null;
    } else {
      // Agregamos
      if (
        this.newCursoMalla.Nombre &&
        this.newCursoMalla.creditos > 0 &&
        this.newCursoMalla.tipo
      ) {
        this.mallaCurricularService.addCursoMallaTemporal(this.newCursoMalla);
      } else {
        console.error('Por favor completar el formulario');
      }
    }
    this.newCursoMalla = new CursoMalla(0, '', 0, 0, '');
  }

  editCursoMalla(index: number) {
    const cursoMalla = this.mallaCurricularService.getCursoMallaTemporal(index);
    if (cursoMalla) {
      this.newCursoMalla = { ...cursoMalla }; // Copy the record to the form
      this.editingIndex = index; // Set the index for editing
    }
  }

  getCursoMallas(): CursoMalla[] {
    return this.mallaCurricularService.getCursoMallasTemporal();
  }

  deleteCursoMalla(index: number) {
    this.mallaCurricularService.deleteCursoMallaTemporal(index);
  }

  createAndSaveCiclo() {
    if (this.solicitud) {
      // Create the CicloMalla
      const newCiclo = new CicloMalla(0, 0, this.nombre, this.solicitud.id);
      this.mallaCurricularService.createCicloMalla(newCiclo).subscribe(
        (createdCiclo: CicloMalla) => {
          if (createdCiclo && createdCiclo.id) {
            // Get local CursoMalla records
            const cursos = this.mallaCurricularService.getCursoMallasTemporal();

            // Update local CursoMalla records with the new id_ciclo
            const updatedCursos = cursos.map((curso) => {
              curso.id_ciclo = createdCiclo.id; // Update id_ciclo
              return curso; // Return updated curso
            });

            // Send each updated CursoMalla to the backend
            const updatePromises = updatedCursos.map((curso) =>
              this.mallaCurricularService.createCursoMalla(curso).toPromise(),
            );

            // Esperamos
            Promise.all(updatePromises)
              .then(() => {
                this.getCursoMallas();
                this.getMallaCiclos();
                this.mallaCurricularService.clearCursoMallasTemporal();
                this.nombre = '';
                this.cdr.detectChanges();
                this.toastr.success(`Se actualizó correctamente.`);
              })
              .catch((error) => {
                console.error('Error saving CursoMalla records:', error);
                this.toastr.error(
                  `Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`,
                );
              });
          } else {
            console.error('Created CicloMalla does not have a valid ID.');
            this.toastr.error(
              `Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`,
            );
          }
        },
        (error) => {
          console.error('Error creating CicloMalla:', error);
          this.toastr.error(
            `Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`,
          );
        },
      );
    } else {
      console.error('Solicitud not found.');
      this.toastr.error(
        `Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`,
      );
    }
  }

  //Funciones para editar Malla
  selectCicloModal(id: number): void {
    if (id) {
      this.cicloId = id;
      this.newCursoMallaEdit = new CursoMalla(0, '', 0, 0, '');
      this.editingIndexEdit = null;
      this.getMalla();
    } else {
      console.error('Invalid ciclo ID');
    }
  }

  getMalla(): void {
    this.cdr.detectChanges();
    const id = this.cicloId;
    this.mallaCurricularService.getCicloMalla(id).subscribe({
      next: (data: CicloMalla[]) => {
        this.relacionMallaData = data;

        if (this.relacionMallaData.length > 0) {
          this.nombre = this.relacionMallaData[0].nombre;

          this.getMallaCursos();
        }
      },
      error: (error) => {
        console.error('Error fetching data', error);
      },
      complete: () => {},
    });
  }

  getMallaCursos() {
    this.mallaCurricularService.getCursoMallaByCiclo(this.cicloId).subscribe({
      next: (data: CursoMalla[]) => {
        this.cursos = data;
      },
      error: (error) => {
        console.error('Error fetching cursos data', error);
      },
      complete: () => {},
    });
  }

  deleteCurso(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar el curso?')) {
      this.mallaCurricularService.deleteCursoMalla(id).subscribe({
        next: (response) => {
          alert('Curso eliminado!');
          this.getMallaCursos();
        },
        error: (error) => {
          console.error('There was an error!', error);
          alert('An error occurred while deleting the course.');
        },
      });
    }
  }

  createCurso(): void {
    this.newCursoMallaEdit.id_ciclo = this.cicloId;

    if (this.editingIndexEdit === null) {
      // Create new curso
      this.mallaCurricularService
        .createCursoMalla(this.newCursoMallaEdit)
        .subscribe({
          next: (response) => {
            this.newCursoMallaEdit = new CursoMalla(0, '', 0, 0, '');
            this.getMallaCursos();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error creating curso', error);
          },
          complete: () => {},
        });
    } else {
      // Update existing curso
      this.newCursoMalla.id = this.cursos[this.editingIndexEdit].id;
      this.mallaCurricularService
        .updateCursoMalla(this.newCursoMallaEdit)
        .subscribe({
          next: (response) => {
            this.newCursoMallaEdit = new CursoMalla(0, '', 0, 0, '');
            this.getMallaCursos();
          },
          error: (error) => {
            console.error('Error updating curso', error);
          },
          complete: () => {},
        });
    }
  }

  editCurso(index: number): void {
    this.newCursoMallaEdit = { ...this.cursos[index] };
    this.editingIndexEdit = index;
  }

  updateCiclo(): void {
    if (this.relacionMallaData.length > 0) {
      const updatedCiclo: CicloMalla = {
        ...this.relacionMallaData[0], // Get the existing ciclo data
        nombre: this.nombre, // Update with the new nombre
      };

      this.mallaCurricularService.updateCicloMalla(updatedCiclo).subscribe({
        next: (response) => {
          this.getCursoMallas();
          this.getMallaCiclos();
          this.toastr.success(`Se actualizó correctamente.`);
        },
        error: (error) => {
          console.error('Error updating ciclo', error);
          this.toastr.error(
            `Error actualizando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`,
          );
        },
        complete: () => {
          this.toastr.success(`Se actualizó correctamente.`);
        },
      });
    }
  }

  notificarEnvioMalla(solicitud: any) {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();

    const fechaFormateada = `${dia}/${mes}/${anio}`;
    this.http
      .post(
        'https://prod-09.brazilsouth.logic.azure.com:443/workflows/3179fa572cea428a8782d3c8d4de64a6/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_hPm3Hjsv-wWzDciN6sPKz8BUq8opHUURXEWSXIJ4oA',
        {
          Estudiante: solicitud.nombre_completo,
          CorreoEstudiante: solicitud.correo,
          FechaSolicitud: fechaFormateada,
        },
      )
      .subscribe();
  }

  validateDates(): void {
    const fechaInicio = new Date(this.solicitud.fecha_inicio);
    const fechaFin = new Date(this.solicitud.fecha_fin_estimada);
    this.fechaFinInvalid = fechaFin < fechaInicio;
  }
}

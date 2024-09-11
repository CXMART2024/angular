import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { CursoMalla } from '../../modelos/curso-malla';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nuevo-ciclo',
  templateUrl: './nuevo-ciclo.component.html',
  styleUrl: './nuevo-ciclo.component.css'
})
export class NuevoCicloComponent implements OnInit {


  newCursoMalla: CursoMalla = new CursoMalla(0, '', 0, 0, '');
  editingIndex: number | null = null;
  solicitud: any;
  nombre: string = '';



  constructor(private cursoMallaService: MallaCurricularService, private solicitudService: SolicitudService, private cdr: ChangeDetectorRef,  private toastr: ToastrService) {

  }

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;

    });

  }


  saveCursoMalla() {
    if (this.editingIndex !== null) {
      // Actualizamos
      this.cursoMallaService.updateCursoMallaTemporal(this.editingIndex, this.newCursoMalla);
      this.editingIndex = null;
    } else {
      // Agregamos
      if (this.newCursoMalla.Nombre && this.newCursoMalla.creditos > 0 && this.newCursoMalla.tipo) {
        this.cursoMallaService.addCursoMallaTemporal(this.newCursoMalla);
      } else {
        console.error('Por favor completar el formulario');
      }
    }
    this.newCursoMalla = new CursoMalla(0, '', 0, 0, '');
  }


  editCursoMalla(index: number) {
    const cursoMalla = this.cursoMallaService.getCursoMallaTemporal(index);
    if (cursoMalla) {
      this.newCursoMalla = { ...cursoMalla }; // Copy the record to the form
      this.editingIndex = index; // Set the index for editing
    }
  }

  getCursoMallas(): CursoMalla[] {
    return this.cursoMallaService.getCursoMallasTemporal();
  }

  deleteCursoMalla(index: number) {
    this.cursoMallaService.deleteCursoMallaTemporal(index);
  }

  createAndSaveCiclo() {
    if (this.solicitud) {
      // Create the CicloMalla
      const newCiclo = new CicloMalla(0, 0, this.nombre, this.solicitud.id);
      this.cursoMallaService.createCicloMalla(newCiclo).subscribe(
        (createdCiclo: CicloMalla) => {
          if (createdCiclo && createdCiclo.id) {
            // Get local CursoMalla records
            const cursos = this.cursoMallaService.getCursoMallasTemporal();

            // Update local CursoMalla records with the new id_ciclo
            const updatedCursos = cursos.map(curso => {
              curso.id_ciclo = createdCiclo.id; // Update id_ciclo
              return curso; // Return updated curso
            });

            // Send each updated CursoMalla to the backend
            const updatePromises = updatedCursos.map(curso =>
              this.cursoMallaService.createCursoMalla(curso).toPromise()
            );

            // Esperamos
            Promise.all(updatePromises)
              .then(() => {
                this.cursoMallaService.clearCursoMallasTemporal();
                this.nombre = '';
                this.cdr.detectChanges();
                this.toastr.success(`Se actualizó correctamente.`);
              })
              .catch(error => {
                console.error('Error saving CursoMalla records:', error);
                this.toastr.error(`Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
              });
          } else {
            console.error('Created CicloMalla does not have a valid ID.');
            this.toastr.error(`Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
          }
        },
        error => {
          console.error('Error creating CicloMalla:', error);
          this.toastr.error(`Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
        }
      );
    } else {
      console.error('Solicitud not found.');
      this.toastr.error(`Error creando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
    }
  }


}

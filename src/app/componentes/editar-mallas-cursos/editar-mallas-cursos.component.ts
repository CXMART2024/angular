import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MallaCurricularService } from '../../servicios/malla-curricular/malla-curricular.service';
import { CicloMalla } from '../../modelos/ciclo-malla';
import { FormBuilder, Validators } from '@angular/forms';
import { RelacionMalla } from '../../modelos/relacion-malla';
import { Ciclo } from '../../modelos/ciclo';
import { CursoMalla } from '../../modelos/curso-malla';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-editar-mallas-cursos',
  templateUrl: './editar-mallas-cursos.component.html',
  styleUrl: './editar-mallas-cursos.component.css'
})
export class EditarMallasCursosComponent implements OnInit {

  cicloId: number = 0;
  editingIndex: number | null = null;
  relacionMallaData: CicloMalla[] = [];
  cursos: CursoMalla[] = [];
  newCursoMalla: CursoMalla = new CursoMalla(0, '', 0, 0, '');
  nombre: string = '';

  constructor(private route: ActivatedRoute, private mallaService: MallaCurricularService, private fb: FormBuilder, private toastr: ToastrService) {

  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cicloId = +id;
        //console.log('Received Ciclo ID:', this.cicloId);
        this.getMalla();

      }
    });

  }

  /*
  getMalla(): void {
    const id = this.cicloId;
    this.mallaService.getCicloMalla(id).subscribe({
      next: (data: CicloMalla[]) => { 
        console.log('API Response:', data); 
        this.relacionMallaData = data; 

      },
      error: (error) => {
        console.error('Error fetching data', error);
      },
      complete: () => {
        console.log('Data completa');
      }
    });
  }*/
  getMalla(): void {
    const id = this.cicloId;
    this.mallaService.getCicloMalla(id).subscribe({
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
      complete: () => {
        
      }
    });
  }

  getMallaCursos() {
    this.mallaService.getCursoMallaByCiclo(this.cicloId).subscribe({
      next: (data: CursoMalla[]) => {
        
        this.cursos = data;
      },
      error: (error) => {
        console.error('Error fetching cursos data', error);
      },
      complete: () => {
        
      }
    });
  }

  deleteCurso(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar el curso?')) {
      this.mallaService.deleteCursoMalla(id).subscribe({
        next: (response) => {
          alert('Curso eliminado!');
          this.getMallaCursos();
        },
        error: (error) => {
          console.error('There was an error!', error);
          alert('An error occurred while deleting the course.');
        }
      });
    }
  }


  /*
  createCurso(): void {

    this.newCursoMalla.id_ciclo = this.cicloId;
    this.mallaService.createCursoMalla(this.newCursoMalla).subscribe({
      next: (response) => {
        console.log('Curso created successfully:', response);

        this.newCursoMalla = new CursoMalla(0, '', 0, 0, '');
        this.getMallaCursos();
      },
      error: (error) => {
        console.error('Error creating curso', error);
      },
      complete: () => {
        console.log('Curso creation complete');
      }
    });
  }*/
  createCurso(): void {
    this.newCursoMalla.id_ciclo = this.cicloId;

    if (this.editingIndex === null) {
      // Create new curso
      this.mallaService.createCursoMalla(this.newCursoMalla).subscribe({
        next: (response) => {
          
          this.newCursoMalla = new CursoMalla(0, '', 0, 0, '');
          this.getMallaCursos();
        },
        error: (error) => {
          console.error('Error creating curso', error);
        },
        complete: () => {
          
        }
      });
    } else {
      // Update existing curso
      this.newCursoMalla.id = this.cursos[this.editingIndex].id;
      this.mallaService.updateCursoMalla(this.newCursoMalla).subscribe({
        next: (response) => {
          
          this.newCursoMalla = new CursoMalla(0, '', 0, 0, '');
          this.getMallaCursos();
        },
        error: (error) => {
          console.error('Error updating curso', error);
        },
        complete: () => {
          
        }
      });
    }
  }


  editCurso(index: number): void {
    this.newCursoMalla = { ...this.cursos[index] };
    this.editingIndex = index;
  }

  updateCiclo(): void {
    if (this.relacionMallaData.length > 0) {
      const updatedCiclo: CicloMalla = {
        ...this.relacionMallaData[0], // Get the existing ciclo data
        nombre: this.nombre // Update with the new nombre
      };

      this.mallaService.updateCicloMalla(updatedCiclo).subscribe({
        next: (response) => {
          
          this.toastr.success(`Se actualizó correctamente.`);
          this.getMalla(); // Refresh the data to reflect changes
        },
        error: (error) => {
          console.error('Error updating ciclo', error);
          this.toastr.error(`Error actualizando el ciclo. Por favor, refresca la página y vuelve a intentarlo.`);
        },
        complete: () => {
          
          this.toastr.success(`Se actualizó correctamente.`);
        }
      });
    }
  }

}






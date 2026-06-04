import { Component,  OnInit } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-contabilidad',
  templateUrl: './contabilidad.component.html',
  styleUrl: './contabilidad.component.css'
})
export class ContabilidadComponent implements OnInit{

  ngAfterViewInit(): void {
    const btnNotificar = document.getElementById('btnNotificar');

    btnNotificar?.addEventListener('click', () => {
      const modal1 = bootstrap.Modal.getInstance(document.getElementById('modalSolicitud'));
      modal1.hide();

      document.getElementById('modalSolicitud')?.addEventListener('hidden.bs.modal', () => {
        const modal2 = new bootstrap.Modal(document.getElementById('modalObservacion'));
        modal2.show();
      }, { once: true });
    });
  }

  ngOnInit(): void {
    
  }
  
}

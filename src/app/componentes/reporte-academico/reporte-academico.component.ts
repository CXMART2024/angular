import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
declare var bootstrap: any;

@Component({
  selector: 'app-reporte-academico',
  templateUrl: './reporte-academico.component.html',
  styleUrl: './reporte-academico.component.css'
})
export class ReporteAcademicoComponent implements OnInit {

  solicitud: any;

  constructor(private solicitudService: SolicitudService) {

  }
  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe(data => {
      this.solicitud = data;

    });
  }


}

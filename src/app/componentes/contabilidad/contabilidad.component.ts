import { Component, OnInit } from '@angular/core';
import { ContabilidadService } from '../../servicios/contabilidad/contabilidad.service';
import { Contabilidad } from '../../modelos/contabilidad';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-contabilidad',
  templateUrl: './contabilidad.component.html',
  styleUrl: './contabilidad.component.css',
})
export class ContabilidadComponent implements OnInit {
  pagos: Contabilidad[] = [];
  pagosFiltrados: Contabilidad[] = [];
  textoBusqueda: string = '';
  estadoSeleccionado: string = '';
  pagoSeleccionado?: Contabilidad;
  cantidadPendientes = 0;
  cantidadPorRevisar = 0;
  cantidadObservados = 0;
  cantidadAprobados = 0;
  cargadoSap: boolean = false;
  observacion: string = '';

  constructor(private contabilidadService: ContabilidadService) {}

  cargarPagos(): void {
    this.contabilidadService.getPagosConEstadoContabilidad().subscribe({
      next: (data) => {
        this.pagos = data;
        this.pagosFiltrados = [...data];
        this.actualizarIndicadores();
        console.log('Pagos cargados:', data);
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
      },
    });
  }

  filtrarPagos(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();
    const estado = this.estadoSeleccionado.trim().toLowerCase();

    this.pagosFiltrados = this.pagos.filter((p) => {
      const coincideTexto =
        !texto ||
        p.nombre_completo?.toLowerCase().includes(texto) ||
        p.institucion_nombre?.toLowerCase().includes(texto);

      const coincideEstado =
        !estado || p.ContabilidadEstado?.toLowerCase() === estado;

      return coincideTexto && coincideEstado;
    });
  }

  abrirSolicitud(pago: any): void {
    this.pagoSeleccionado = pago;

    const estado = pago.ContabilidadEstado?.trim().toLowerCase();

    let modalId = '';

    switch (estado) {
      case 'pendiente':
        modalId = 'modalSolicitud2';
        break;

      case 'aprobado':
      case 'en tesorería':
      case 'en tesoreria':
        modalId = 'modalSolicitud3';
        break;

      default:
        modalId = 'modalSolicitud';
        break;
    }

    const modal = new bootstrap.Modal(document.getElementById(modalId));

    modal.show();
  }

  obtenerNombreArchivo(url: string | null | undefined): string {
    if (!url || url.trim() === '') {
      return 'Sin archivo';
    }

    try {
      return decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
    } catch {
      return url.substring(url.lastIndexOf('/') + 1);
    }
  }

  abrirDocumento(url: string | null | undefined): void {
    if (!url) {
      return;
    }

    window.open(url, '_blank');
  }

  comunicarCargadoSap(): void {
    if (!this.pagoSeleccionado) {
      return;
    }
    const pagoActualizado: Contabilidad = {
      ...this.pagoSeleccionado,

      cCargoSap: this.cargadoSap,
      fecha_carga_SAP: new Date(),

      ContabilidadEstado: 'En Tesorería',
      TesoreriaEstado: 'Pendiente',
    };

    this.contabilidadService.updatePagoCont(pagoActualizado).subscribe({
      next: () => {
        // Actualizar el objeto local para reflejar los cambios
        this.pagoSeleccionado = pagoActualizado;

        // Recargar la tabla
        this.cargarPagos();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById('modalSolicitud2'),
        );

        modal?.hide();

        console.log('Pago actualizado correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar pago:', err);
      },
    });

    this.cargarPagos();
  }

  notificarObservacion(): void {
    if (!this.pagoSeleccionado) {
      return;
    }

    const pagoActualizado: Contabilidad = {
      ...this.pagoSeleccionado,
      observacion: this.observacion,
      ContabilidadEstado: 'Observado',
    };

    this.contabilidadService.updatePagoCont(pagoActualizado).subscribe({
      next: () => {
        this.pagoSeleccionado = pagoActualizado;

        // Limpiar textarea
        this.observacion = '';

        // Recargar tabla
        this.cargarPagos();

        // Cerrar modalObservacion
        const modalObservacion = bootstrap.Modal.getInstance(
          document.getElementById('modalObservacion'),
        );

        modalObservacion?.hide();

        // Cerrar modalSolicitud por si sigue abierto
        const modalSolicitud = bootstrap.Modal.getInstance(
          document.getElementById('modalSolicitud'),
        );

        modalSolicitud?.hide();
      },
      error: (err) => {
        console.error('Error al guardar observación:', err);
      },
    });
  }

  aprobarConstancia(): void {
    if (!this.pagoSeleccionado) {
      return;
    }

    const pagoActualizado: Contabilidad = {
      ...this.pagoSeleccionado,
      ContabilidadEstado: 'Aprobado',
      fecha_aprobacion: new Date(),
    };

    this.contabilidadService.updatePagoCont(pagoActualizado).subscribe({
      next: () => {
        this.pagoSeleccionado = pagoActualizado;

        // Recargar la tabla
        this.cargarPagos();

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById('modalSolicitud'),
        );

        modal?.hide();
      },
      error: (err) => {
        console.error('Error al aprobar constancia:', err);
      },
    });
  }

  formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) {
      return '';
    }

    const fechaObj = new Date(fecha);

    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  actualizarIndicadores(): void {
    this.cantidadPendientes = this.pagos.filter(
      (p) => p.ContabilidadEstado === 'Pendiente',
    ).length;

    this.cantidadPorRevisar = this.pagos.filter(
      (p) => p.ContabilidadEstado === 'Por Revisar',
    ).length;

    this.cantidadObservados = this.pagos.filter(
      (p) => p.ContabilidadEstado === 'Observado',
    ).length;

    this.cantidadAprobados = this.pagos.filter(
      (p) => p.ContabilidadEstado === 'Aprobado',
    ).length;
  }

  getEstadoStyle(estado: string) {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return {
          'background-color': '#FFF9C4',
          color: '#92400e',
          'font-weight': '500',
        };

      case 'por revisar':
        return {
          'background-color': '#FFE082',
          color: '#92400e',
          'font-weight': '500',
        };

      case 'aprobado':
        return {
          'background-color': '#d1fae5',
          color: '#065f46',
          'font-weight': '500',
        };

      case 'en tesorería':
      case 'en tesoreria':
        return {
          'background-color': '#dbeafe',
          color: '#1e40af',
          'font-weight': '500',
        };

      case 'observado':
        return {
          'background-color': '#fce7f3',
          color: '#9d174d',
          'font-weight': '500',
        };

      default:
        return {
          'background-color': '#e5e7eb',
          color: '#374151',
          'font-weight': '500',
        };
    }
  }

  ngOnInit(): void {
    this.cargarPagos();
  }

  ngAfterViewInit(): void {
    const btnNotificar = document.getElementById('btnNotificar');

    btnNotificar?.addEventListener('click', () => {
      const modal1 = bootstrap.Modal.getInstance(
        document.getElementById('modalSolicitud'),
      );
      modal1.hide();

      document.getElementById('modalSolicitud')?.addEventListener(
        'hidden.bs.modal',
        () => {
          const modal2 = new bootstrap.Modal(
            document.getElementById('modalObservacion'),
          );
          modal2.show();
        },
        { once: true },
      );
    });
  }
}

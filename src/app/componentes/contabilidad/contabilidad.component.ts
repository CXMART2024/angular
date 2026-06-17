import { Component, OnInit } from '@angular/core';
import { ContabilidadService } from '../../servicios/contabilidad/contabilidad.service';
import { Contabilidad } from '../../modelos/contabilidad';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';
import { PagoService } from '../../servicios/pago/pago.service';

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

  constructor(
    private contabilidadService: ContabilidadService,
    private solicitudService: SolicitudService,
    private pagoService: PagoService,
    private http: HttpClient,
    private toastr: ToastrService,
  ) {}

  cargarPagos(): void {
    this.contabilidadService.getPagosConEstadoContabilidad().subscribe({
      next: (data) => {
        // Ordenar de más reciente a más antiguo por fecha_solicitud
        this.pagos = data.sort((a, b) => {
          return (
            new Date(b.fecha_solicitud).getTime() -
            new Date(a.fecha_solicitud).getTime()
          );
        });

        this.pagosFiltrados = [...this.pagos];
        this.actualizarIndicadores();
        console.log('Pagos cargados y ordenados:', this.pagosFiltrados);
      },
      error: (err) => {
        console.error('Error cargando pagos:', err);
      },
    });
  }

  cargarEstadosInicialesPagos(): void {
    if (!this.pagoSeleccionado?.id) {
      console.error('No existe un id de pago');
      return;
    }

    this.pagoService
      .createEstadosInicialesPago(
        'soportebi_fo@crosland.com.pe',
        this.pagoSeleccionado.id,
      )
      .subscribe({
        next: (response) => {
          console.log('Estados creados', response);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  cargarEstadosConta(estado: string): void {
    if (!this.pagoSeleccionado?.id) {
      console.error('No existe un id de pago');
      return;
    }

    this.pagoService
      .createEstadosConta(
        'soportebi_fo@crosland.com.pe',
        estado,
        this.pagoSeleccionado.id,
      )
      .subscribe({
        next: (response) => {
          console.log('Estados creados', response);
        },
        error: (error) => {
          console.error(error);
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

    // >>> SE AGREGA ESTA SECCIÓN AQUÍ ABAJO <<<
    // Ordenar de más reciente a más antiguo por fecha_solicitud
    this.pagosFiltrados.sort((a, b) => {
      return (
        new Date(b.fecha_solicitud).getTime() -
        new Date(a.fecha_solicitud).getTime()
      );
    });
  }

  enviarCorreoPago() {
    // 1. Obtenemos el ID de la solicitud desde el pago seleccionado
    const idSolicitud = this.pagoSeleccionado?.id_solicitud; // <-- Cambia aquí según cómo se llame el campo id en tu modelo 'Contabilidad'

    if (!idSolicitud) {
      this.toastr.error(
        'No se encontró el ID de la solicitud asociado a este pago.',
      );
      return;
    }

    // 2. Buscamos la solicitud por su ID antes de armar el envío
    this.solicitudService.getSolicitudById(idSolicitud).subscribe({
      next: (solicitudObtenida: any) => {
        if (!solicitudObtenida) {
          this.toastr.error(
            'No se encontró ninguna solicitud con el ID proporcionado.',
          );
          return;
        }

        // 3. Si la encuentra con éxito, armamos el payload para el correo
        const payload = {
          solicitante: {
            // Usamos el nombre real devuelto por la base de datos de solicitudes
            nombre_completo: solicitudObtenida.nombre_completo || '',
          },
          pago: {
            concepto: this.pagoSeleccionado?.concepto,
            monto: this.pagoSeleccionado?.monto,
            fecha_solicitud: this.pagoSeleccionado?.fecha_solicitud,
          },
          cargadoEnSAP: 'Si',
          fechaCargaSAP: new Date().toISOString(),
        };

        // 4. Enviamos el correo
        this.http
          .post('https://backendbecas.azurewebsites.net/correo/pago', payload)
          .subscribe({
            next: () => {
              this.toastr.success('Correo enviado correctamente.');
            },
            error: (error) => {
              console.error('Error enviando correo:', error);
              this.toastr.error('Error al enviar el correo.');
            },
          });
      },
      error: (err) => {
        console.error('Error al buscar la solicitud por ID:', err);
        this.toastr.error(
          'Error al verificar los datos de la solicitud en el servidor.',
        );
      },
    });
  }

  enviarCorreoPagoAprobado() {
    // 1. Obtenemos el ID de la solicitud desde el pago seleccionado
    const idSolicitud = this.pagoSeleccionado?.id_solicitud; // <-- Cambia aquí según cómo se llame el campo id en tu modelo 'Contabilidad'

    if (!idSolicitud) {
      this.toastr.error(
        'No se encontró el ID de la solicitud asociado a este pago.',
      );
      return;
    }

    // 2. Buscamos la solicitud por su ID antes de armar el envío
    this.solicitudService.getSolicitudById(idSolicitud).subscribe({
      next: (solicitudObtenida: any) => {
        if (!solicitudObtenida) {
          this.toastr.error(
            'No se encontró ninguna solicitud con el ID proporcionado.',
          );
          return;
        }

        // 3. Si la encuentra con éxito, armamos el payload para el correo
        const payload = {
          solicitante: solicitudObtenida.nombre_completo,
          correo: solicitudObtenida.correo,
          concepto: this.pagoSeleccionado?.concepto,
        };

        // 4. Enviamos el correo
        this.http
          .post(
            'https://backendbecas.azurewebsites.net/correo/aprobado',
            payload,
          )
          .subscribe({
            next: () => {
              this.toastr.success('Correo enviado correctamente.');
            },
            error: (error) => {
              console.error('Error enviando correo:', error);
              this.toastr.error('Error al enviar el correo.');
            },
          });
      },
      error: (err) => {
        console.error('Error al buscar la solicitud por ID:', err);
        this.toastr.error(
          'Error al verificar los datos de la solicitud en el servidor.',
        );
      },
    });
  }

  enviarCorreoPagoNegado() {
    // 1. Obtenemos el ID de la solicitud desde el pago seleccionado
    const idSolicitud = this.pagoSeleccionado?.id_solicitud; // <-- Cambia aquí según cómo se llame el campo id en tu modelo 'Contabilidad'

    if (!idSolicitud) {
      this.toastr.error(
        'No se encontró el ID de la solicitud asociado a este pago.',
      );
      return;
    }

    // 2. Buscamos la solicitud por su ID antes de armar el envío
    this.solicitudService.getSolicitudById(idSolicitud).subscribe({
      next: (solicitudObtenida: any) => {
        if (!solicitudObtenida) {
          this.toastr.error(
            'No se encontró ninguna solicitud con el ID proporcionado.',
          );
          return;
        }

        // 3. Si la encuentra con éxito, armamos el payload para el correo
        const payload = {
          solicitante: solicitudObtenida.nombre_completo,
          correo: solicitudObtenida.correo,
          concepto: this.pagoSeleccionado?.concepto,
          observacion: this.observacion,
        };

        // 4. Enviamos el correo
        this.http
          .post('https://backendbecas.azurewebsites.net/correo/negado', payload)
          .subscribe({
            next: () => {
              this.toastr.success('Correo enviado correctamente.');
            },
            error: (error) => {
              console.error('Error enviando correo:', error);
              this.toastr.error('Error al enviar el correo.');
            },
          });
      },
      error: (err) => {
        console.error('Error al buscar la solicitud por ID:', err);
        this.toastr.error(
          'Error al verificar los datos de la solicitud en el servidor.',
        );
      },
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
    this.cargarEstadosInicialesPagos();
    this.enviarCorreoPago();
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
        this.cargarEstadosConta('Observado');
        this.enviarCorreoPagoNegado();
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
        this.cargarEstadosConta('Aprobado');
        this.enviarCorreoPagoAprobado();
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

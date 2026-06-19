export class Contabilidad {
  id: number;
  fecha_solicitud: Date;
  monto: number;
  concepto: string;
  descripcion: string;
  id_constancia_pago: string;
  id_doc_anticipo: string;
  id_evidencia_pago: string;
  id_solicitud: number;
  id_registroCiclo: number;
  ContabilidadEstado: string;
  TesoreriaEstado: string;
  PagoEstado: string;
  adminestado: string;
  cCargoSap: boolean;
  EstudianteEstado: string;
  nro_cuentabancaria?: string;
  codigo_sociedad?: string;
  ceco?: string;
  area_solicitante?: string;
  moneda?: string;
  fecha_regularizacion?: Date;
  fecha_aprobacion?: Date;
  fecha_carga_SAP?: Date;
  fecha_emision?: Date;
  nombre_completo?: string;
  observacion?: string;
  institucion_nombre?: string;
  ruc_institucion?: string;

  constructor(
    id: number,
    fecha_solicitud: Date,
    monto: number,
    concepto: string,
    descripcion: string,
    id_constancia_pago: string,
    id_doc_anticipo: string,
    id_evidencia_pago: string,
    id_solicitud: number,
    id_registroCiclo: number,
    ContabilidadEstado: string,
    TesoreriaEstado: string,
    PagoEstado: string,
    adminestado: string,
    EstudianteEstado: string,
    nro_cuentabancaria: string,
    codigo_sociedad: string,
    ceco: string,
    area_solicitante: string,
    moneda: string,
    fecha_regularizacion: Date,
    fecha_aprobacion: Date,
    fecha_carga_SAP: Date,
    cCargoSap: boolean,
    observacion: string,

    nombre_completo: string,
    institucion_nombre: string,
    ruc_institucion: string,
  ) {
    this.id = id;
    this.fecha_solicitud = fecha_solicitud;
    this.monto = monto;
    this.concepto = concepto;
    this.descripcion = descripcion;
    this.id_constancia_pago = id_constancia_pago;
    this.id_evidencia_pago = id_evidencia_pago;
    this.id_doc_anticipo = id_doc_anticipo;
    this.id_solicitud = id_solicitud;
    this.id_registroCiclo = id_registroCiclo;
    this.ContabilidadEstado = ContabilidadEstado;
    this.TesoreriaEstado = TesoreriaEstado;
    this.PagoEstado = PagoEstado;
    this.adminestado = adminestado;
    this.EstudianteEstado = EstudianteEstado;
    this.nro_cuentabancaria = nro_cuentabancaria;
    this.codigo_sociedad = codigo_sociedad;
    this.ceco = ceco;
    this.area_solicitante = area_solicitante;
    this.cCargoSap = cCargoSap;
    this.moneda = moneda;
    this.fecha_regularizacion = fecha_regularizacion;
    this.fecha_aprobacion = fecha_aprobacion;
    this.fecha_carga_SAP = fecha_carga_SAP;
    this.nombre_completo = nombre_completo;
    this.observacion = observacion;
    this.institucion_nombre = institucion_nombre;
    this.ruc_institucion = ruc_institucion;
  }
}

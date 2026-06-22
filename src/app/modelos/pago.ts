export class Pago {
  id: number;
  fecha_solicitud: Date;
  monto: number;
  concepto: string;
  descripcion: string;
  id_constancia_pago: string;
  id_solicitud: number;
  id_registroCiclo: number;
  ContabilidadEstado: string;
  TesoreriaEstado: string;
  PagoEstado: string;
  adminestado: string;
  EstudianteEstado: string;
  nro_cuentabancaria?: string;
  codigo_sociedad?: string;
  ceco?: string;
  area_solicitante?: string;
  moneda?: string;
  fecha_regularizacion?: Date;
  fecha_emision?: Date;
  constructor(
    id: number,
    fecha_solicitud: Date,
    monto: number,
    concepto: string,
    descripcion: string,
    id_constancia_pago: string,
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
  ) {
    this.id = id;
    this.fecha_solicitud = fecha_solicitud;
    this.monto = monto;
    this.concepto = concepto;
    this.descripcion = descripcion;
    this.id_constancia_pago = id_constancia_pago;
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
    this.moneda = moneda;
    this.fecha_regularizacion = fecha_regularizacion;
  }
}

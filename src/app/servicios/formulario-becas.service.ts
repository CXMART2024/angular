import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Becas_Solicitudes } from '../modelos/Becas_Solicitudes';

@Injectable({
  providedIn: 'root'
})
export class FormularioBecasService {

  //formData: any = {};
  private formData: any = {};

  constructor() { }


  setFormData(data: any) {
    this.formData = { ...this.formData, ...data };
  }

  getFormData() {
    return this.formData;
  }

  clearFormData() {
    this.formData = {};
  }

}

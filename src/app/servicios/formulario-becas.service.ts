import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormularioBecasService {

  private formData: any = {};
  private uploadedFiles: {
    evidencia?: File;
    dni?: File;
    certificado?: File;
    comprobante?: File;
  } = {};

  constructor() { }

  setFormData(data: any) {
    this.formData = { ...this.formData, ...data };
  }

  getFormData() {
    return this.formData;
  }

  clearFormData() {
    this.formData = {};
    this.uploadedFiles = {};
  }

  setUploadedFile(key: 'evidencia' | 'dni' | 'certificado' | 'comprobante', file: File) {
    this.uploadedFiles[key] = file;
  }

  getUploadedFiles() {
    return this.uploadedFiles;
  }

}

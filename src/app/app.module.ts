import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './componentes/login/login.component';
import { DetalleAcademicoComponent } from './componentes/detalle-academico/detalle-academico.component';
import { InformacionBecaComponent } from './componentes/informacion-beca/informacion-beca.component';
import { NuevoCicloComponent } from './componentes/nuevo-ciclo/nuevo-ciclo.component';
import { InformacionBecaViewComponent } from './componentes/informacion-beca-view/informacion-beca-view.component';
import { NuevoCicloAcademicoComponent } from './componentes/nuevo-ciclo-academico/nuevo-ciclo-academico.component';
import { ConceptoCicloAcademicoComponent } from './componentes/concepto-ciclo-academico/concepto-ciclo-academico.component';
import { EditarCicloAcademicoComponent } from './componentes/editar-ciclo-academico/editar-ciclo-academico.component';
import { ReporteAcademicoComponent } from './componentes/reporte-academico/reporte-academico.component';
import { RegisterFormComponent } from './componentes/register-form/register-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RegisterFormNextComponent } from './componentes/register-form-next/register-form-next.component';
import { RegisterFormFinalComponent } from './componentes/register-form-final/register-form-final.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { EditarMallasCursosComponent } from './componentes/editar-mallas-cursos/editar-mallas-cursos.component';
import { DatePipe } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DetalleAcademicoComponent,
    InformacionBecaComponent,
    NuevoCicloComponent,
    InformacionBecaViewComponent,
    NuevoCicloAcademicoComponent,
    ConceptoCicloAcademicoComponent,
    EditarCicloAcademicoComponent,
    ReporteAcademicoComponent,
    RegisterFormComponent,
    RegisterFormNextComponent,
    RegisterFormFinalComponent,
    EditarMallasCursosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxCaptchaModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right', // Puedes cambiar la posición aquí
      timeOut: 3000,
      preventDuplicates: true,
      progressBar: true,
    }),
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [
    provideAnimationsAsync(),
    DatePipe,
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

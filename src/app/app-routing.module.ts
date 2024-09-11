import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { RegisterFormNextComponent } from './componentes/register-form-next/register-form-next.component';
import { RegisterFormFinalComponent } from './componentes/register-form-final/register-form-final.component';

import { authGuard } from './servicios/guard/auth.guard';
import { EditarMallasCursosComponent } from './componentes/editar-mallas-cursos/editar-mallas-cursos.component';

const routes: Routes = [
{path: '', component:LoginComponent},
{path: 'informacion', component: InformacionBecaComponent, canActivate: [authGuard]},
{path: 'informacion-view',component:InformacionBecaViewComponent, canActivate: [authGuard]},
{path: 'detalle', component: DetalleAcademicoComponent, canActivate: [authGuard]},
{path: 'addmodulo', component: NuevoCicloComponent, canActivate: [authGuard]},
{path: 'add-modulo-academico', component: NuevoCicloAcademicoComponent, canActivate: [authGuard]},
{path: 'edit-modulo-academico', component: EditarCicloAcademicoComponent, canActivate: [authGuard]},
{path: 'concepto-modulo-academico',component: ConceptoCicloAcademicoComponent, canActivate: [authGuard]},
{path: 'reporte-academico', component: ReporteAcademicoComponent, canActivate: [authGuard]},
{path: 'register-form', component: RegisterFormComponent},
{path: 'register-form-next', component: RegisterFormNextComponent},
{path: 'register-form-final', component: RegisterFormFinalComponent},
{path: 'informacion/:id', component: EditarMallasCursosComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

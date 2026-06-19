import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth/auth.service';
import { SolicitudService } from '../../servicios/solicitud/solicitud.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  // Si el becario ya guardó su información obligatoria, el enlace
  // "Información Beca" debe llevar a la vista de solo lectura.
  informacionGuardada = false;

  constructor(
    private authService: AuthService,
    private solicitudService: SolicitudService,
  ) {}

  ngOnInit(): void {
    this.solicitudService.getSolicitudData().subscribe((data) => {
      this.informacionGuardada = data?.informacionGuardada === '1';
    });
  }

  get informacionBecaRuta(): string {
    return this.informacionGuardada ? '/informacion-view' : '/informacion';
  }

  logout() {
    this.authService.logout();
  }
}

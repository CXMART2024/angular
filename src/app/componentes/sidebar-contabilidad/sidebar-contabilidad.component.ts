import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth/auth.service';

@Component({
  selector: 'app-sidebar-contabilidad',
  templateUrl: './sidebar-contabilidad.component.html',
  styleUrl: './sidebar-contabilidad.component.css',
})
export class SidebarContabilidadComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

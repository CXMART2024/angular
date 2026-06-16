import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'becasFormMain';

  constructor(public router: Router) {}

  showSidebar(): boolean {
    const url = this.router.url;

    const hiddenRoutes = [
      '/register-form',
      '/register-form-next',
      '/register-form-final',
      '/',
      '/addmodulo',
      '/add-modulo-academico',
      '/edit-modulo-academico',
    ];

    const isInformacionEdit = /^\/informacion\/[^/]+$/.test(url);

    return !hiddenRoutes.includes(url) && !isInformacionEdit;
  }

  isContabilidad(): boolean {
    return this.router.url === '/contabilidad';
  }
}

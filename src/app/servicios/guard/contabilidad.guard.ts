import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const contabilidadGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin() && authService.tienePermiso('Contabilidad')) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

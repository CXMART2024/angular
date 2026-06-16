import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { contabilidadGuard } from './contabilidad.guard';

describe('contabilidadGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => contabilidadGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

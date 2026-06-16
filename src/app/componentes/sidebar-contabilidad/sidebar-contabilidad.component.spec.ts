import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarContabilidadComponent } from './sidebar-contabilidad.component';

describe('SidebarContabilidadComponent', () => {
  let component: SidebarContabilidadComponent;
  let fixture: ComponentFixture<SidebarContabilidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarContabilidadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SidebarContabilidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

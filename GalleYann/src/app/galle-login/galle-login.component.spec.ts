import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleLoginComponent } from './galle-login.component';

describe('GalleLoginComponent', () => {
  let component: GalleLoginComponent;
  let fixture: ComponentFixture<GalleLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

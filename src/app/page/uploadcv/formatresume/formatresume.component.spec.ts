import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatresumeComponent } from './formatresume.component';

describe('FormatresumeComponent', () => {
  let component: FormatresumeComponent;
  let fixture: ComponentFixture<FormatresumeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatresumeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatresumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

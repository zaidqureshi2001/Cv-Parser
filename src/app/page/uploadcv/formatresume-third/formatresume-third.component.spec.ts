import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatresumeThirdComponent } from './formatresume-third.component';

describe('FormatresumeThirdComponent', () => {
  let component: FormatresumeThirdComponent;
  let fixture: ComponentFixture<FormatresumeThirdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatresumeThirdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatresumeThirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

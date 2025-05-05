import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatresumeTwoComponent } from './formatresume-two.component';

describe('FormatresumeTwoComponent', () => {
  let component: FormatresumeTwoComponent;
  let fixture: ComponentFixture<FormatresumeTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatresumeTwoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatresumeTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

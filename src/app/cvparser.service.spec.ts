import { TestBed } from '@angular/core/testing';

import { CvparserService } from './cvparser.service';

describe('CvparserService', () => {
  let service: CvparserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CvparserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

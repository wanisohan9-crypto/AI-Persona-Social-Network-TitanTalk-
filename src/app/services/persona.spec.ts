import { TestBed } from '@angular/core/testing';

import { Persona } from './persona';
import { PersonaService } from './persona';


describe('PersonaService', () => {
  let service: PersonaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

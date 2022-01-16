import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckPlayComponent } from './deck-play.component';

describe('DeckPlayComponent', () => {
  let component: DeckPlayComponent;
  let fixture: ComponentFixture<DeckPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeckPlayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

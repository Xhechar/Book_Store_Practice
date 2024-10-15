import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNotebookComponent } from './new-notebook.component';

describe('NewNotebookComponent', () => {
  let component: NewNotebookComponent;
  let fixture: ComponentFixture<NewNotebookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewNotebookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewNotebookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component } from '@angular/core';
import { ExportsSearchFormComponent } from './exports-search-form/exports-search-form.component';

@Component({
  selector: 'app-exports-search',
  standalone: true,
  imports: [ExportsSearchFormComponent],
  template: `
    <app-exports-search-form></app-exports-search-form>
  `,
})
export class ExportsSearchComponent {}

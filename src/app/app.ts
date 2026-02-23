import { Component, signal } from '@angular/core';
import { Slider } from './slider/slider';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Slider],
  template: `<app-slider></app-slider>`,
})
export class App {
  protected readonly title = signal('angularProject');
}

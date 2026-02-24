import { Directive } from '@angular/core';

@Directive({
  selector: '[appZoom]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class ZoomDirective {
  onMouseEnter(): void {
    const target = event?.target as HTMLElement;
    if (target) {
      target.style.transform = 'scale(1.1)';
    }
  }

  onMouseLeave(): void {
    const target = event?.target as HTMLElement;
    if (target) {
      target.style.transform = 'scale(1)';
    }
  }
}

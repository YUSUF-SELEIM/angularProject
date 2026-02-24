import { Directive } from '@angular/core';

@Directive({
  selector: '[appShadow]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class ShadowDirective {
  private element = document.currentScript?.ownerDocument?.defaultView?.document as Document;

  onMouseEnter(): void {
    const target = event?.target as HTMLElement;
    if (target) {
      target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
      target.style.transform = 'translateY(-4px)';
    }
  }

  onMouseLeave(): void {
    const target = event?.target as HTMLElement;
    if (target) {
      target.style.boxShadow = 'none';
      target.style.transform = 'translateY(0)';
    }
  }
}

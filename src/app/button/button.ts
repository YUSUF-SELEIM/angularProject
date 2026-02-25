import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      class="btn"
      [style.backgroundColor]="disabled() ? '#ccc' : color()"
      [disabled]="disabled()"
      [class.disabled]="disabled()"
      (click)="onClick.emit()"
    >
      {{ title() }}
    </button>
  `,
  styles: [
    `
      .btn {
        padding: 8px 20px;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-size: 14px;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        &:disabled,
        &.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  title = input.required<string>();
  color = input<string>('#007bff');
  disabled = input<boolean>(false);
  onClick = output<void>();
}

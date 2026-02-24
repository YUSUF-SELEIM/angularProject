import { Pipe, PipeTransform } from '@angular/core';
import { Component, signal } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  private expandedTexts = new Map<string, boolean>();

  transform(value: string, limit: number = 100): string {
    if (!value) return '';

    const isExpanded = this.expandedTexts.get(value) ?? false;
    if (isExpanded || value.length <= limit) {
      return value;
    }

    return value.substring(0, limit) + '...';
  }

  toggle(text: string): void {
    const current = this.expandedTexts.get(text) ?? false;
    this.expandedTexts.set(text, !current);
  }

  isExpanded(text: string): boolean {
    return this.expandedTexts.get(text) ?? false;
  }
}

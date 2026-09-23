import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-space-xl bg-surface-container-lowest rounded-xl max-w-md flex flex-col gap-space-md">
      <div class="flex items-center gap-space-md">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
             [ngClass]="data.isDestructive ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'">
          <span class="material-symbols-outlined text-xl">{{ data.isDestructive ? 'warning' : 'help' }}</span>
        </div>
        <div class="flex flex-col">
          <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">{{ data.title }}</h3>
        </div>
      </div>

      <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
        {{ data.message }}
      </p>

      <div class="flex items-center justify-end gap-space-sm pt-space-sm">
        <button
          type="button"
          (click)="dialogRef.close(false)"
          class="px-space-md py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-title-md text-title-md transition-colors">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button
          type="button"
          (click)="dialogRef.close(true)"
          class="px-space-lg py-2 rounded-lg font-title-md text-title-md transition-all shadow-sm"
          [ngClass]="data.isDestructive ? 'bg-error text-on-error hover:bg-red-700' : 'bg-primary-container text-on-primary hover:bg-primary'">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}

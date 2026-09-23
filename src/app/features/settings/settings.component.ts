import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../../core/services/settings.service';
import { Settings } from '../../core/models/task.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private snackBar = inject(MatSnackBar);

  settingsForm!: FormGroup;
  isSaving = signal<boolean>(false);
  initialSettings: Settings = { id: 1, daily_sp_limit: 8, weekly_sp_limit: 40 };

  softThresholdPct = signal<number>(85);

  ngOnInit(): void {
    this.settingsForm = this.fb.group({
      daily_sp_limit: [8, [Validators.required, Validators.min(1)]],
      weekly_sp_limit: [40, [Validators.required, Validators.min(1)]]
    });

    this.loadSettings();
  }

  loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (res) => {
        this.initialSettings = res.data;
        this.settingsForm.patchValue({
          daily_sp_limit: res.data.daily_sp_limit,
          weekly_sp_limit: res.data.weekly_sp_limit
        });
      }
    });
  }

  currentDailyLimit(): number {
    return Number(this.settingsForm.get('daily_sp_limit')?.value || 8);
  }

  currentWeeklyLimit(): number {
    return Number(this.settingsForm.get('weekly_sp_limit')?.value || 40);
  }

  safeLimit(): number {
    return Math.max(1, Math.round(this.currentDailyLimit() * 0.75));
  }

  calculatedSoftSP(): number {
    return Math.round((this.currentWeeklyLimit() * this.softThresholdPct()) / 100);
  }

  incrementDaily(): void {
    const cur = this.currentDailyLimit();
    if (cur < 24) {
      this.settingsForm.patchValue({ daily_sp_limit: cur + 1 });
    }
  }

  decrementDaily(): void {
    const cur = this.currentDailyLimit();
    if (cur > 1) {
      this.settingsForm.patchValue({ daily_sp_limit: cur - 1 });
    }
  }

  incrementWeekly(): void {
    const cur = this.currentWeeklyLimit();
    if (cur < 100) {
      this.settingsForm.patchValue({ weekly_sp_limit: cur + 5 });
    }
  }

  decrementWeekly(): void {
    const cur = this.currentWeeklyLimit();
    if (cur > 5) {
      this.settingsForm.patchValue({ weekly_sp_limit: cur - 5 });
    }
  }

  onSliderChange(event: any): void {
    this.softThresholdPct.set(parseInt(event.target.value, 10));
  }

  resetForm(): void {
    this.settingsForm.patchValue({
      daily_sp_limit: this.initialSettings.daily_sp_limit,
      weekly_sp_limit: this.initialSettings.weekly_sp_limit
    });
  }

  onSave(): void {
    if (this.settingsForm.invalid) return;

    this.isSaving.set(true);
    const value = this.settingsForm.value;

    this.settingsService.updateSettings(value).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.initialSettings = res.data;
        this.snackBar.open('Capacity planning limits updated globally.', 'Close', {
          duration: 3500,
          panelClass: ['custom-toast-success'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
        window.dispatchEvent(new CustomEvent('taskboard:task-updated'));
      },
      error: (err) => {
        this.isSaving.set(false);
        this.snackBar.open(err.error?.message || 'Failed to save settings.', 'Dismiss', {
          duration: 4000,
          panelClass: ['custom-toast-error'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

export interface TaskDialogData {
  task?: Task;
  defaultStatus?: TaskStatus;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss'
})
export class TaskDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  data: TaskDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);

  isEditMode = !!this.data.task;
  isSaving = signal<boolean>(false);
  capacityError = signal<{ message: string; remainingDaily?: number; remainingWeekly?: number } | null>(null);

  taskForm!: FormGroup;

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    const initialPlanned = this.data.task?.planned_date || today;
    const initialDue = this.data.task?.due_date || initialPlanned;

    this.taskForm = this.fb.group({
      title: [this.data.task?.title || '', [Validators.required, Validators.maxLength(255)]],
      description: [this.data.task?.description || ''],
      story_points: [this.data.task?.story_points || 3, [Validators.required, Validators.min(1)]],
      priority: [this.data.task?.priority || 'Medium', [Validators.required]],
      status: [this.data.task?.status || this.data.defaultStatus || 'Backlog', [Validators.required]],
      planned_date: [initialPlanned, [Validators.required]],
      due_date: [initialDue, [Validators.required]]
    }, { validators: this.dateComparisonValidator });
  }

  dateComparisonValidator(group: FormGroup) {
    const pDate = group.get('planned_date')?.value;
    const dDate = group.get('due_date')?.value;
    if (pDate && dDate) {
      if (new Date(dDate) < new Date(pDate)) {
        return { invalidDueDate: true };
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.capacityError.set(null);

    const formValue = this.taskForm.value;

    if (this.isEditMode && this.data.task) {
      this.taskService.updateTask(this.data.task.id, formValue).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          this.isSaving.set(false);
          if (err.error?.code === 'CAPACITY_EXCEEDED') {
            this.capacityError.set({
              message: err.error.message,
              remainingDaily: err.error.remainingDaily,
              remainingWeekly: err.error.remainingWeekly
            });
          }
        }
      });
    } else {
      this.taskService.createTask(formValue).subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.dialogRef.close(res.data);
        },
        error: (err) => {
          this.isSaving.set(false);
          if (err.error?.code === 'CAPACITY_EXCEEDED') {
            this.capacityError.set({
              message: err.error.message,
              remainingDaily: err.error.remainingDaily,
              remainingWeekly: err.error.remainingWeekly
            });
          }
        }
      });
    }
  }

  onDelete(): void {
    if (!this.data.task) return;

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to permanently delete task TB-${this.data.task.id}: "${this.data.task.title}"? This action cannot be undone.`,
        confirmText: 'Delete Task',
        cancelText: 'Cancel',
        isDestructive: true
      }
    });

    confirmRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.data.task) {
        this.taskService.deleteTask(this.data.task.id).subscribe({
          next: () => {
            this.dialogRef.close({ deleted: true, id: this.data.task!.id });
          }
        });
      }
    });
  }
}

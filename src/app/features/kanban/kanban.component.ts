import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskDialogComponent } from '../../shared/components/task-dialog/task-dialog.component';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit {
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  allTasks: Task[] = [];
  backlogTasks = signal<Task[]>([]);
  plannedTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  completedTasks = signal<Task[]>([]);
  totalCommittedSP = signal<number>(0);

  selectedPriority = 'All';
  searchQuery = '';

  ngOnInit(): void {
    this.loadTasks();
    window.addEventListener('taskboard:task-updated', () => this.loadTasks());
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (res) => {
        this.allTasks = res.data;
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allTasks];

    if (this.selectedPriority !== 'All') {
      filtered = filtered.filter(t => t.priority === this.selectedPriority);
    }

    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }

    this.backlogTasks.set(filtered.filter(t => t.status === 'Backlog'));
    this.plannedTasks.set(filtered.filter(t => t.status === 'Planned'));
    this.inProgressTasks.set(filtered.filter(t => t.status === 'In Progress'));
    this.completedTasks.set(filtered.filter(t => t.status === 'Completed'));

    const committed = filtered
      .filter(t => t.status !== 'Backlog')
      .reduce((acc, t) => acc + t.story_points, 0);
    this.totalCommittedSP.set(committed);
  }

  onPriorityFilter(event: any): void {
    this.selectedPriority = event.target.value;
    this.applyFilters();
  }

  onSearchFilter(event: any): void {
    this.searchQuery = event.target.value;
    this.applyFilters();
  }

  getColumnSP(tasks: Task[]): number {
    return tasks.reduce((sum, t) => sum + t.story_points, 0);
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const task = event.previousContainer.data[event.previousIndex];
    const sourceStatus = event.previousContainer.id as TaskStatus;
    const targetStatus = event.container.id as TaskStatus;

    // RULE: Completed tasks cannot be moved back to Backlog
    if (sourceStatus === 'Completed' && targetStatus === 'Backlog') {
      this.snackBar.open('Business Rule: Completed tasks cannot be moved back to Backlog.', 'Dismiss', {
        duration: 4000,
        panelClass: ['custom-toast-error'],
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      });
      return;
    }

    // Optimistic UI move
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.applyFilters();

    // Call backend to persist status update
    this.taskService.updateTask(task.id, { status: targetStatus }).subscribe({
      next: (res) => {
        // Updated successfully
        task.status = targetStatus;
        this.snackBar.open(`Task TB-${task.id} moved to ${targetStatus}.`, 'Close', {
          duration: 2500,
          panelClass: ['custom-toast-success'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
        window.dispatchEvent(new CustomEvent('taskboard:task-updated'));
      },
      error: (err) => {
        // Rollback move on failure / capacity exceeded
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
        this.applyFilters();

        const message = err.error?.message || 'Move failed: Daily or Weekly capacity limit exceeded.';
        this.snackBar.open(message, 'Dismiss', {
          duration: 6000,
          panelClass: ['custom-toast-error'],
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  openCreateTaskDialog(defaultStatus: TaskStatus = 'Backlog'): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { defaultStatus }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.loadTasks();
    });
  }

  openEditTaskDialog(task: Task): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { task }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.loadTasks();
    });
  }
}

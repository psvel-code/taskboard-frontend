import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskDialogComponent } from '../../shared/components/task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss'
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'story_points', 'planned_date', 'due_date', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);

  isLoading = signal<boolean>(false);
  totalTasks = signal<number>(0);
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('All');
  selectedPriority = signal<string>('All');
  sortBy = signal<string>('created_at');
  sortOrder = signal<string>('DESC');

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // 300ms Search Debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.pageIndex.set(0);
      this.fetchTasks();
    });

    this.fetchTasks();
    window.addEventListener('taskboard:task-updated', () => this.fetchTasks());
  }

  fetchTasks(): void {
    this.isLoading.set(true);

    this.taskService.getTasks({
      search: this.searchTerm(),
      status: this.selectedStatus(),
      priority: this.selectedPriority(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      page: this.pageIndex() + 1,
      limit: this.pageSize()
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.dataSource.data = res.data;
        this.totalTasks.set(res.pagination.total);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  onSearchInput(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchSubject.next('');
  }

  onStatusChange(event: any): void {
    this.selectedStatus.set(event.target.value);
    this.pageIndex.set(0);
    this.fetchTasks();
  }

  onPriorityChange(event: any): void {
    this.selectedPriority.set(event.target.value);
    this.pageIndex.set(0);
    this.fetchTasks();
  }

  onSortChange(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortOrder.set(sort.direction ? sort.direction.toUpperCase() : 'DESC');
    this.fetchTasks();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.fetchTasks();
  }

  openCreateTaskDialog(): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { defaultStatus: 'Backlog' }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.fetchTasks();
    });
  }

  openEditTaskDialog(task: Task): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { task }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.fetchTasks();
    });
  }

  onDeleteTask(task: Task): void {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to permanently delete task TB-${task.id}: "${task.title}"?`,
        confirmText: 'Delete Task',
        cancelText: 'Cancel',
        isDestructive: true
      }
    });

    confirmRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.snackBar.open(`Task TB-${task.id} deleted.`, 'Close', {
              duration: 3000,
              panelClass: ['custom-toast-success'],
              horizontalPosition: 'end',
              verticalPosition: 'bottom'
            });
            this.fetchTasks();
            window.dispatchEvent(new CustomEvent('taskboard:task-updated'));
          }
        });
      }
    });
  }
}

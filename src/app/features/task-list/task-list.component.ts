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
  template: `
    <div class="flex flex-col w-full p-gutter-lg space-y-gutter">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div>
          <div class="flex items-center gap-space-sm text-outline">
            <span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Sprint Backlog &amp; Tasks</span>
            <span class="inline-block w-1 h-1 rounded-full bg-outline"></span>
            <span class="font-label-sm text-label-sm text-primary font-semibold">Server-Side Filtered</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold mt-0.5">
            Task Repository &amp; Velocity Ledger
          </h1>
        </div>

        <button
          (click)="openCreateTaskDialog()"
          class="flex items-center gap-space-xs px-space-md py-2 bg-primary-container text-on-primary hover:bg-primary shadow-sm rounded-lg transition-all font-title-md text-title-md cursor-pointer"
          type="button">
          <span class="material-symbols-outlined text-base">add</span>
          <span>Create Task</span>
        </button>
      </div>

      <!-- Controls & Filter Card -->
      <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container flex flex-wrap items-center justify-between gap-space-md">
        
        <!-- Search Input with 300ms Debounce -->
        <div class="flex items-center gap-space-xs bg-surface-container-low px-space-md py-2 rounded-lg text-on-surface-variant w-full md:w-80 focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary transition-all">
          <span class="material-symbols-outlined text-lg text-outline">search</span>
          <input
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            class="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
            placeholder="Search by task title or description..." type="text" />
          @if (searchTerm()) {
            <button (click)="clearSearch()" class="text-outline hover:text-on-surface">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          }
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex flex-wrap items-center gap-space-sm">
          <!-- Status Filter -->
          <div class="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface">
            <span class="material-symbols-outlined text-base text-outline">donut_large</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Status:</span>
            <select
              (change)="onStatusChange($event)"
              class="bg-transparent font-title-md text-title-md text-on-surface focus:outline-none cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div class="flex items-center gap-1.5 px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface">
            <span class="material-symbols-outlined text-base text-outline">flag</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">Priority:</span>
            <select
              (change)="onPriorityChange($event)"
              class="bg-transparent font-title-md text-title-md text-on-surface focus:outline-none cursor-pointer">
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <!-- Total Count Badge -->
          <div class="px-space-md py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold">
            {{ totalTasks() }} tasks found
          </div>
        </div>

      </div>

      <!-- MatTable Container -->
      <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        
        @if (isLoading()) {
          <div class="p-8 flex items-center justify-center gap-space-sm text-primary">
            <svg class="animate-spin h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="font-title-md text-title-md font-medium">Loading tasks from database...</span>
          </div>
        }

        <table
          mat-table
          [dataSource]="dataSource"
          matSort
          (matSortChange)="onSortChange($event)"
          class="w-full text-left border-collapse">

          <!-- Task ID Column -->
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container">
              Key
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3 font-label-md text-label-md text-primary font-bold">
              TB-{{ task.id }}
            </td>
          </ng-container>

          <!-- Title & Description Column -->
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container">
              Task Title &amp; Description
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3 min-w-[280px]">
              <div class="flex flex-col">
                <span (click)="openEditTaskDialog(task)" class="font-title-md text-title-md font-semibold text-on-surface hover:text-primary cursor-pointer line-clamp-1">
                  {{ task.title }}
                </span>
                @if (task.description) {
                  <span class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                    {{ task.description }}
                  </span>
                }
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container">
              Status
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold"
                    [ngClass]="{
                      'bg-surface-container-highest text-on-surface-variant': task.status === 'Backlog',
                      'bg-secondary-fixed text-on-secondary-fixed': task.status === 'Planned',
                      'bg-primary-fixed text-on-primary-fixed': task.status === 'In Progress',
                      'bg-emerald-100 text-emerald-800': task.status === 'Completed'
                    }">
                {{ task.status }}
              </span>
            </td>
          </ng-container>

          <!-- Priority Column -->
          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container">
              Priority
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3">
              <span [ngClass]="'badge-priority-' + task.priority.toLowerCase()">
                <span class="w-1.5 h-1.5 rounded-full"
                      [ngClass]="{
                        'bg-emerald-600': task.priority === 'Low',
                        'bg-amber-500': task.priority === 'Medium',
                        'bg-slate-600': task.priority === 'High',
                        'bg-red-600': task.priority === 'Critical'
                      }"></span>
                {{ task.priority }}
              </span>
            </td>
          </ng-container>

          <!-- Story Points Column -->
          <ng-container matColumnDef="story_points">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container text-center">
              Story Points
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3 text-center">
              <span class="inline-block px-2.5 py-0.5 rounded bg-surface-container font-label-md text-label-md font-bold text-on-surface">
                {{ task.story_points }} SP
              </span>
            </td>
          </ng-container>

          <!-- Planned Date Column -->
          <ng-container matColumnDef="planned_date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container">
              Planned Date
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3 font-body-sm text-body-sm text-on-surface-variant">
              {{ task.planned_date }}
            </td>
          </ng-container>

          <!-- Due Date Column -->
          <ng-container matColumnDef="due_date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container">
              Due Date
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3 font-body-sm text-body-sm text-on-surface-variant">
              {{ task.due_date }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="px-space-md py-3 font-title-md text-title-md text-on-surface-variant uppercase tracking-wider bg-surface-container-low border-b border-surface-container text-right">
              Actions
            </th>
            <td mat-cell *matCellDef="let task" class="px-space-md py-3 text-right">
              <div class="flex items-center justify-end gap-space-xs">
                <button
                  (click)="openEditTaskDialog(task)"
                  class="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                  title="Edit Task">
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  (click)="onDeleteTask(task)"
                  class="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors cursor-pointer"
                  title="Delete Task">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-surface-container-low transition-colors duration-150 border-b border-surface-container"></tr>
        </table>

        @if (!isLoading() && dataSource.data.length === 0) {
          <div class="p-12 text-center text-on-surface-variant font-body-md">
            No tasks match the active filters.
          </div>
        }

        <!-- Server-side MatPaginator -->
        <mat-paginator
          [length]="totalTasks()"
          [pageSize]="pageSize()"
          [pageIndex]="pageIndex()"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
          class="border-t border-surface-container bg-surface-container-lowest">
        </mat-paginator>

      </div>

    </div>
  `
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

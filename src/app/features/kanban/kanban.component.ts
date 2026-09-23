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
  template: `
    <div class="flex flex-col w-full min-h-full">
      
      <!-- Top Filter & Sprint Summary Bar (Matching Stitch template) -->
      <div class="w-full bg-surface-container-lowest px-space-xl py-space-md shadow-sm border-b border-surface-container">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          
          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-space-sm">
            <div class="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold transition-colors">
              <span class="material-symbols-outlined text-base text-primary">sprint</span>
              <span class="font-label-md text-label-md">Sprint 24 (Active)</span>
            </div>

            <!-- Priority Filter Dropdown -->
            <div class="flex items-center gap-1.5 px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
              <span class="material-symbols-outlined text-base text-tertiary">filter_list</span>
              <span class="font-label-md text-label-md text-on-surface-variant">Priority:</span>
              <select
                (change)="onPriorityFilter($event)"
                class="bg-transparent font-label-md text-label-md font-semibold text-on-surface focus:outline-none cursor-pointer">
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <!-- Search & Add Task CTA -->
          <div class="flex items-center gap-space-md flex-wrap lg:flex-nowrap justify-between lg:justify-end">
            <div class="flex items-center gap-space-xs bg-surface-container-low px-space-md py-1.5 rounded-lg text-on-surface-variant w-56 focus-within:ring-2 focus-within:ring-primary focus-within:bg-surface-container-lowest">
              <span class="material-symbols-outlined text-base text-outline">search</span>
              <input
                (input)="onSearchFilter($event)"
                class="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="Filter cards..." type="text" />
            </div>

            <div class="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-lg">
              <span class="material-symbols-outlined text-base text-primary">data_usage</span>
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm text-on-surface-variant leading-none">Sprint Scope</span>
                <span class="font-title-md text-title-md text-on-surface leading-tight font-semibold">
                  {{ totalCommittedSP() }} SP committed
                </span>
              </div>
            </div>

            <button
              (click)="openCreateTaskDialog()"
              class="flex items-center gap-space-xs px-space-md py-2 bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-lg font-title-md text-title-md shadow-sm cursor-pointer"
              type="button">
              <span class="material-symbols-outlined text-base">add</span>
              <span>Add Task</span>
            </button>
          </div>

        </div>
      </div>

      <!-- Drag & Drop Kanban Columns Grid -->
      <div class="w-full overflow-x-auto p-space-xl" cdkDropListGroup>
        <div class="flex items-start gap-space-lg min-w-max pb-space-lg">
          
          <!-- ============================================== -->
          <!-- Column 1: Backlog -->
          <!-- ============================================== -->
          <div class="w-80 flex flex-col bg-surface-container-low rounded-xl p-space-sm shadow-sm select-none border border-surface-container">
            <div class="sticky top-0 z-10 flex items-center justify-between p-space-sm bg-surface-container-low rounded-t-lg mb-space-xs">
              <div class="flex items-center gap-space-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-outline"></span>
                <h2 class="font-title-lg text-title-lg text-on-surface font-semibold">Backlog</h2>
                <span class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {{ backlogTasks().length }}
                </span>
              </div>
              <div class="flex items-center gap-space-xs">
                <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {{ getColumnSP(backlogTasks()) }} SP
                </span>
                <button
                  (click)="openCreateTaskDialog('Backlog')"
                  class="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                  title="Add to Backlog">
                  <span class="material-symbols-outlined text-base">add</span>
                </button>
              </div>
            </div>

            <!-- Backlog Drop List -->
            <div
              cdkDropList
              id="Backlog"
              [cdkDropListData]="backlogTasks()"
              (cdkDropListDropped)="onDrop($event)"
              class="flex flex-col gap-space-sm min-h-[550px] p-1 rounded-lg">
              
              @for (task of backlogTasks(); track task.id) {
                <div
                  cdkDrag
                  [cdkDragData]="task"
                  (click)="openEditTaskDialog(task)"
                  class="bg-surface-container-lowest rounded-lg p-space-md shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-surface-container">
                  <div class="flex items-center justify-between mb-space-xs">
                    <span [ngClass]="'badge-priority-' + task.priority.toLowerCase()">
                      {{ task.priority }} Priority
                    </span>
                    <div class="flex items-center gap-1">
                      <span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                        {{ task.story_points }} SP
                      </span>
                      <span class="material-symbols-outlined text-outline text-base">drag_indicator</span>
                    </div>
                  </div>
                  
                  <span class="block font-title-md text-title-md text-on-surface font-semibold hover:text-primary mb-space-sm leading-snug">
                    TB-{{ task.id }}: {{ task.title }}
                  </span>

                  <div class="flex items-center justify-between text-on-surface-variant pt-space-xs border-t border-surface-container-low text-label-sm">
                    <span class="flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-sm">calendar_today</span>
                      {{ task.planned_date }}
                    </span>
                    <span class="text-outline font-label-sm">Due: {{ task.due_date }}</span>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center p-space-xl border-2 border-dashed border-outline-variant/50 rounded-lg text-outline text-body-sm">
                  <span>No backlog tasks</span>
                </div>
              }

            </div>
          </div>

          <!-- ============================================== -->
          <!-- Column 2: Planned -->
          <!-- ============================================== -->
          <div class="w-80 flex flex-col bg-surface-container-low rounded-xl p-space-sm shadow-sm select-none border border-surface-container">
            <div class="sticky top-0 z-10 flex items-center justify-between p-space-sm bg-surface-container-low rounded-t-lg mb-space-xs">
              <div class="flex items-center gap-space-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h2 class="font-title-lg text-title-lg text-on-surface font-semibold">Planned</h2>
                <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-label-sm text-label-sm font-semibold">
                  {{ plannedTasks().length }}
                </span>
              </div>
              <div class="flex items-center gap-space-xs">
                <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {{ getColumnSP(plannedTasks()) }} SP
                </span>
                <button
                  (click)="openCreateTaskDialog('Planned')"
                  class="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                  title="Add to Planned">
                  <span class="material-symbols-outlined text-base">add</span>
                </button>
              </div>
            </div>

            <!-- Planned Drop List -->
            <div
              cdkDropList
              id="Planned"
              [cdkDropListData]="plannedTasks()"
              (cdkDropListDropped)="onDrop($event)"
              class="flex flex-col gap-space-sm min-h-[550px] p-1 rounded-lg">
              
              @for (task of plannedTasks(); track task.id) {
                <div
                  cdkDrag
                  [cdkDragData]="task"
                  (click)="openEditTaskDialog(task)"
                  class="bg-surface-container-lowest rounded-lg p-space-md shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-surface-container">
                  <div class="flex items-center justify-between mb-space-xs">
                    <span [ngClass]="'badge-priority-' + task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                    <div class="flex items-center gap-1">
                      <span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                        {{ task.story_points }} SP
                      </span>
                      <span class="material-symbols-outlined text-outline text-base">drag_indicator</span>
                    </div>
                  </div>

                  <span class="block font-title-md text-title-md text-on-surface font-semibold hover:text-primary mb-space-sm leading-snug">
                    TB-{{ task.id }}: {{ task.title }}
                  </span>

                  <div class="flex items-center justify-between text-on-surface-variant pt-space-xs border-t border-surface-container-low text-label-sm">
                    <span class="flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-sm">schedule</span>
                      {{ task.planned_date }}
                    </span>
                    <span class="text-outline font-label-sm">Due: {{ task.due_date }}</span>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center p-space-xl border-2 border-dashed border-outline-variant/50 rounded-lg text-outline text-body-sm">
                  <span>No planned tasks</span>
                </div>
              }

            </div>
          </div>

          <!-- ============================================== -->
          <!-- Column 3: In Progress -->
          <!-- ============================================== -->
          <div class="w-80 flex flex-col bg-secondary-fixed/20 rounded-xl p-space-sm shadow-sm select-none ring-1 ring-primary-container/30 border border-primary-container/20">
            <div class="sticky top-0 z-10 flex items-center justify-between p-space-sm bg-transparent rounded-t-lg mb-space-xs">
              <div class="flex items-center gap-space-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                <h2 class="font-title-lg text-title-lg text-on-surface font-semibold">In Progress</h2>
                <span class="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold">
                  {{ inProgressTasks().length }}
                </span>
              </div>
              <div class="flex items-center gap-space-xs">
                <span class="px-2 py-0.5 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-semibold shadow-xs">
                  {{ getColumnSP(inProgressTasks()) }} SP
                </span>
                <button
                  (click)="openCreateTaskDialog('In Progress')"
                  class="p-1 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  title="Add to In Progress">
                  <span class="material-symbols-outlined text-base">add</span>
                </button>
              </div>
            </div>

            <!-- In Progress Drop List -->
            <div
              cdkDropList
              id="In Progress"
              [cdkDropListData]="inProgressTasks()"
              (cdkDropListDropped)="onDrop($event)"
              class="flex flex-col gap-space-sm min-h-[550px] p-1 rounded-lg">
              
              @for (task of inProgressTasks(); track task.id) {
                <div
                  cdkDrag
                  [cdkDragData]="task"
                  (click)="openEditTaskDialog(task)"
                  class="bg-surface-container-lowest rounded-lg p-space-md shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-primary-container/30">
                  <div class="flex items-center justify-between mb-space-xs">
                    <span [ngClass]="'badge-priority-' + task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                    <div class="flex items-center gap-1">
                      <span class="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                        {{ task.story_points }} SP
                      </span>
                      <span class="material-symbols-outlined text-outline text-base">drag_indicator</span>
                    </div>
                  </div>

                  <span class="block font-title-md text-title-md text-on-surface font-semibold hover:text-primary mb-space-sm leading-snug">
                    TB-{{ task.id }}: {{ task.title }}
                  </span>

                  <div class="flex items-center justify-between text-on-surface-variant pt-space-xs border-t border-surface-container-low text-label-sm">
                    <span class="flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-sm">timelapse</span>
                      {{ task.planned_date }}
                    </span>
                    <span class="text-outline font-label-sm">Due: {{ task.due_date }}</span>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center p-space-xl border-2 border-dashed border-outline-variant/50 rounded-lg text-outline text-body-sm">
                  <span>No in-progress tasks</span>
                </div>
              }

            </div>
          </div>

          <!-- ============================================== -->
          <!-- Column 4: Completed -->
          <!-- ============================================== -->
          <div class="w-80 flex flex-col bg-surface-container-low rounded-xl p-space-sm shadow-sm select-none border border-surface-container">
            <div class="sticky top-0 z-10 flex items-center justify-between p-space-sm bg-surface-container-low rounded-t-lg mb-space-xs">
              <div class="flex items-center gap-space-sm">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 class="font-title-lg text-title-lg text-on-surface font-semibold">Completed</h2>
                <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">
                  {{ completedTasks().length }}
                </span>
              </div>
              <div class="flex items-center gap-space-xs">
                <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  {{ getColumnSP(completedTasks()) }} SP
                </span>
                <button
                  (click)="openCreateTaskDialog('Completed')"
                  class="p-1 rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                  title="Add to Completed">
                  <span class="material-symbols-outlined text-base">add</span>
                </button>
              </div>
            </div>

            <!-- Completed Drop List -->
            <div
              cdkDropList
              id="Completed"
              [cdkDropListData]="completedTasks()"
              (cdkDropListDropped)="onDrop($event)"
              class="flex flex-col gap-space-sm min-h-[550px] p-1 rounded-lg">
              
              @for (task of completedTasks(); track task.id) {
                <div
                  cdkDrag
                  [cdkDragData]="task"
                  (click)="openEditTaskDialog(task)"
                  class="bg-surface-container-lowest rounded-lg p-space-md shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-surface-container opacity-85">
                  <div class="flex items-center justify-between mb-space-xs">
                    <span [ngClass]="'badge-priority-' + task.priority.toLowerCase()">
                      {{ task.priority }}
                    </span>
                    <div class="flex items-center gap-1">
                      <span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                        {{ task.story_points }} SP
                      </span>
                      <span class="material-symbols-outlined text-outline text-base">drag_indicator</span>
                    </div>
                  </div>

                  <span class="block font-title-md text-title-md text-on-surface line-through hover:text-primary mb-space-sm leading-snug">
                    TB-{{ task.id }}: {{ task.title }}
                  </span>

                  <div class="flex items-center justify-between text-on-surface-variant pt-space-xs border-t border-surface-container-low text-label-sm">
                    <span class="flex items-center gap-0.5 text-emerald-700 font-semibold">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      Completed
                    </span>
                    <span class="text-outline font-label-sm">{{ task.planned_date }}</span>
                  </div>
                </div>
              } @empty {
                <div class="flex flex-col items-center justify-center p-space-xl border-2 border-dashed border-outline-variant/50 rounded-lg text-outline text-body-sm">
                  <span>No completed tasks</span>
                </div>
              }

            </div>
          </div>

        </div>
      </div>

    </div>
  `
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

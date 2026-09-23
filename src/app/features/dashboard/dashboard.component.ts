import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DashboardService } from '../../core/services/dashboard.service';
import { TaskService } from '../../core/services/task.service';
import { DashboardSummary, Task } from '../../core/models/task.model';
import { TaskDialogComponent } from '../../shared/components/task-dialog/task-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col w-full p-gutter-lg space-y-gutter-lg">
      
      <!-- Top Title and Filter Header -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
        <div>
          <div class="flex items-center gap-space-sm text-outline">
            <span class="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Sprint Velocity &amp; Workload Cockpit</span>
            <span class="inline-block w-1 h-1 rounded-full bg-outline"></span>
            <span class="font-label-sm text-label-sm text-primary font-semibold">Active: Sprint 24</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight font-semibold mt-0.5">
            Sprint Executive Health &amp; Capacity
          </h1>
        </div>

        <div class="flex items-center gap-space-sm">
          <button
            routerLink="/kanban"
            class="flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container-lowest hover:bg-surface-container shadow-sm rounded-lg text-on-surface transition-all font-title-md text-title-md border border-surface-container cursor-pointer"
            type="button">
            <span class="material-symbols-outlined text-base text-primary">view_kanban</span>
            <span>Kanban Board</span>
          </button>
          <button
            (click)="openNewTaskDialog()"
            class="flex items-center gap-space-xs px-space-md py-1.5 bg-primary-container text-on-primary hover:bg-primary shadow-sm rounded-lg transition-all font-title-md text-title-md cursor-pointer"
            type="button">
            <span class="material-symbols-outlined text-base">add</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      <!-- 6 KPI Summary Cards (Direct Stitch HTML reproduction) -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-gutter">
        
        <!-- 1. Total Tasks -->
        <div class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all group cursor-pointer border border-surface-container"
             routerLink="/task-list">
          <div class="absolute top-0 left-0 right-0 h-1 bg-secondary"></div>
          <div class="flex items-center justify-between text-secondary mb-space-sm">
            <span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Total Tasks</span>
            <div class="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-secondary-container transition-colors">
              <span class="material-symbols-outlined text-lg text-secondary">checklist</span>
            </div>
          </div>
          <div class="flex items-baseline gap-space-xs mb-1">
            <span class="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {{ summary()?.totalTasks || 0 }}
            </span>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">across all workflows</span>
        </div>

        <!-- 2. Backlog Tasks -->
        <div class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all group cursor-pointer border border-surface-container"
             [routerLink]="['/task-list']" [queryParams]="{ status: 'Backlog' }">
          <div class="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Backlog</span>
            <div class="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-amber-100 transition-colors">
              <span class="material-symbols-outlined text-lg text-amber-600">inventory_2</span>
            </div>
          </div>
          <div class="flex items-baseline gap-space-xs mb-1">
            <span class="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {{ summary()?.backlogTasks || 0 }}
            </span>
            <span class="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-label-sm text-label-sm font-semibold">Triage</span>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">zero capacity impact</span>
        </div>

        <!-- 3. Planned Tasks -->
        <div class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all group cursor-pointer border border-surface-container"
             [routerLink]="['/task-list']" [queryParams]="{ status: 'Planned' }">
          <div class="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Planned</span>
            <div class="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-blue-100 transition-colors">
              <span class="material-symbols-outlined text-lg text-blue-600">calendar_today</span>
            </div>
          </div>
          <div class="flex items-baseline gap-space-xs mb-1">
            <span class="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {{ summary()?.plannedTasks || 0 }}
            </span>
            <span class="font-label-sm text-label-sm text-blue-700 font-medium">Ready</span>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">capacity allocated</span>
        </div>

        <!-- 4. In Progress Tasks -->
        <div class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all group cursor-pointer border border-surface-container"
             [routerLink]="['/task-list']" [queryParams]="{ status: 'In Progress' }">
          <div class="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">In Progress</span>
            <div class="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-primary-fixed transition-colors">
              <span class="material-symbols-outlined text-lg text-primary">pending</span>
            </div>
          </div>
          <div class="flex items-baseline gap-space-xs mb-1">
            <span class="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {{ summary()?.inProgressTasks || 0 }}
            </span>
            <span class="px-1.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">Active</span>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">active execution</span>
        </div>

        <!-- 5. Completed Tasks -->
        <div class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all group cursor-pointer border border-surface-container"
             [routerLink]="['/task-list']" [queryParams]="{ status: 'Completed' }">
          <div class="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Completed</span>
            <div class="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-emerald-100 transition-colors">
              <span class="material-symbols-outlined text-lg text-emerald-600">task_alt</span>
            </div>
          </div>
          <div class="flex items-baseline gap-space-xs mb-1">
            <span class="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {{ summary()?.completedTasks || 0 }}
            </span>
            <span class="font-label-sm text-label-sm text-emerald-600 font-semibold flex items-center">
              <span class="material-symbols-outlined text-xs mr-0.5">verified</span>Done
            </span>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">shipped &amp; verified</span>
        </div>

        <!-- 6. Total Story Points -->
        <div class="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-all group cursor-pointer border border-surface-container"
             routerLink="/settings">
          <div class="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
          <div class="flex items-center justify-between mb-space-sm">
            <span class="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Story Points</span>
            <div class="p-1.5 rounded-lg bg-surface-container-low group-hover:bg-secondary-container transition-colors">
              <span class="material-symbols-outlined text-lg text-primary">analytics</span>
            </div>
          </div>
          <div class="flex items-baseline gap-space-xs mb-1">
            <span class="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">
              {{ summary()?.totalStoryPoints || 0 }}
            </span>
            <span class="font-title-md text-title-md text-outline">SP</span>
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant">estimated total scope</span>
        </div>

      </div>

      <!-- Capacity Health & Workload Distribution Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        <!-- Left: Velocity & Capacity Health (Span 7) -->
        <div class="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-container flex flex-col gap-space-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-primary text-xl">speed</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Weekly Capacity Thresholds</h2>
            </div>
            <a routerLink="/settings" class="font-label-md text-label-md text-primary hover:underline font-semibold flex items-center gap-1">
              Configure Limits →
            </a>
          </div>

          <div class="p-space-lg rounded-xl bg-surface-container-low flex flex-col gap-space-md">
            <div class="flex items-center justify-between">
              <div>
                <span class="font-title-md text-title-md text-on-surface font-semibold">Current Week Allocation</span>
                <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Mon ({{ summary()?.currentWeek?.weekStart }}) — Sun ({{ summary()?.currentWeek?.weekEnd }})
                </p>
              </div>
              <div class="text-right">
                <span class="font-headline-sm text-headline-sm text-primary font-bold">
                  {{ summary()?.currentWeek?.allocatedWeekSP || 0 }} / {{ summary()?.settings?.weekly_sp_limit || 40 }} SP
                </span>
                <span class="block font-label-sm text-label-sm text-on-surface-variant">
                  {{ summary()?.currentWeek?.remainingWeekSP || 0 }} SP remaining
                </span>
              </div>
            </div>

            <!-- Progress Meter -->
            <div class="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                [ngClass]="(summary()?.currentWeek?.utilizationPercent || 0) > 85 ? 'bg-error' : 'bg-primary'"
                [style.width.%]="summary()?.currentWeek?.utilizationPercent || 0">
              </div>
            </div>

            <div class="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span>0 SP (Safe)</span>
              <span>Daily Limit: <strong>{{ summary()?.settings?.daily_sp_limit || 8 }} SP / day</strong></span>
              <span>Weekly Cap: <strong>{{ summary()?.settings?.weekly_sp_limit || 40 }} SP</strong></span>
            </div>
          </div>

          <!-- Capacity Rules Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div class="p-space-md rounded-lg bg-surface-container-low border border-surface-container flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-primary text-xl mt-0.5">shield</span>
              <div class="flex flex-col">
                <span class="font-title-md text-title-md text-on-surface font-semibold">Strict Daily Guard</span>
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                  Tasks exceeding daily cap ({{ summary()?.settings?.daily_sp_limit || 8 }} SP) cannot be planned.
                </p>
              </div>
            </div>
            <div class="p-space-md rounded-lg bg-surface-container-low border border-surface-container flex items-start gap-space-sm">
              <span class="material-symbols-outlined text-primary text-xl mt-0.5">rule</span>
              <div class="flex flex-col">
                <span class="font-title-md text-title-md text-on-surface font-semibold">Backlog Isolation</span>
                <p class="font-body-sm text-body-sm text-on-surface-variant">
                  Backlog tickets never consume sprint capacity until moved to Planned.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Active Tasks Snapshot (Span 5) -->
        <div class="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-xl shadow-sm border border-surface-container flex flex-col gap-space-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-sm">
              <span class="material-symbols-outlined text-primary text-xl">dataset</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Active Sprint Tasks</h2>
            </div>
            <a routerLink="/kanban" class="font-label-md text-label-md text-primary hover:underline font-semibold">
              View Kanban →
            </a>
          </div>

          <div class="flex flex-col gap-space-sm divide-y divide-surface-container">
            @for (task of activeTasks(); track task.id) {
              <div
                (click)="openEditTaskDialog(task)"
                class="pt-space-sm first:pt-0 flex items-center justify-between hover:bg-surface-container-low p-2 rounded-lg transition-colors cursor-pointer">
                <div class="flex flex-col min-w-0 pr-space-md">
                  <div class="flex items-center gap-space-xs mb-0.5">
                    <span class="font-label-sm text-label-sm font-bold text-primary">TB-{{ task.id }}</span>
                    <span [ngClass]="'badge-priority-' + task.priority.toLowerCase()">{{ task.priority }}</span>
                  </div>
                  <span class="font-title-md text-title-md text-on-surface truncate">{{ task.title }}</span>
                </div>
                <div class="flex items-center gap-space-sm shrink-0">
                  <span class="px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-semibold text-on-surface">
                    {{ task.story_points }} SP
                  </span>
                  <span class="material-symbols-outlined text-outline text-base">chevron_right</span>
                </div>
              </div>
            } @empty {
              <div class="p-space-xl text-center text-on-surface-variant font-body-sm">
                No active tasks found in the sprint.
              </div>
            }
          </div>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);

  summary = signal<DashboardSummary | null>(null);
  activeTasks = signal<Task[]>([]);

  ngOnInit(): void {
    this.loadData();
    window.addEventListener('taskboard:task-updated', () => this.loadData());
  }

  loadData(): void {
    this.dashboardService.getSummary().subscribe({
      next: (res) => this.summary.set(res.data)
    });

    this.taskService.getTasks({ limit: 5, sortBy: 'updated_at', sortOrder: 'DESC' }).subscribe({
      next: (res) => this.activeTasks.set(res.data)
    });
  }

  openNewTaskDialog(): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { defaultStatus: 'Backlog' }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.loadData();
    });
  }

  openEditTaskDialog(task: Task): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { task }
    });
    ref.afterClosed().subscribe(res => {
      if (res) this.loadData();
    });
  }
}

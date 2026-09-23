import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { TaskDialogComponent } from '../../shared/components/task-dialog/task-dialog.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-background flex flex-col font-body-md text-on-surface">
      <!-- Fixed Top Header -->
      <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
        <div class="w-full h-16 px-gutter flex items-center justify-between gap-space-lg">
          
          <!-- Logo & Workspace Selector -->
          <div class="flex items-center gap-space-lg min-w-max">
            <div class="flex items-center gap-space-sm cursor-pointer" routerLink="/dashboard">
              <div class="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-bold text-sm shadow-sm">
                TB
              </div>
              <span class="font-title-lg text-title-lg text-on-surface tracking-tight font-semibold">TaskBoard Enterprise</span>
            </div>
            <div class="h-5 w-px bg-surface-variant"></div>
            <div class="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low text-on-surface-variant">
              <span class="font-label-md text-label-md">Core Engineering Sprint 24</span>
              <span class="material-symbols-outlined text-base">expand_more</span>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="flex-1 max-w-xl hidden md:flex items-center">
            <div class="w-full flex items-center px-space-md py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant focus-within:bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary transition-all">
              <span class="material-symbols-outlined text-lg mr-space-sm">search</span>
              <input
                class="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
                placeholder="Search tasks, epics, sprint backlog..."
                type="text"
                (keydown.enter)="onSearch($event)" />
              <kbd class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">⌘K</kbd>
            </div>
          </div>

          <!-- Header Actions -->
          <div class="flex items-center gap-space-md min-w-max">
            <button
              (click)="openNewTaskDialog()"
              class="flex items-center gap-space-xs px-space-md py-2 bg-primary-container text-on-primary hover:bg-primary transition-colors rounded-lg font-title-md text-title-md shadow-[0_1px_2px_rgba(15,23,42,0.05)] cursor-pointer"
              type="button">
              <span class="material-symbols-outlined text-base">add</span>
              <span>New Task</span>
            </button>

            <div class="h-5 w-px bg-surface-variant"></div>

            <!-- Profile & Logout dropdown -->
            <div class="flex items-center gap-space-sm cursor-pointer group relative">
              <div class="relative">
                <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">
                  {{ userInitials() }}
                </div>
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-container-lowest"></span>
              </div>
              <div class="hidden xl:flex flex-col text-left">
                <span class="font-title-md text-title-md text-on-surface leading-tight font-semibold">{{ currentUserEmail() }}</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Engineering Lead</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      <!-- Fixed Sidebar -->
      <aside class="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container z-40 flex flex-col justify-between pt-space-md pb-space-lg overflow-y-auto">
        <div class="flex flex-col gap-space-md">
          <div class="px-space-md">
            <span class="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Workspace View</span>
          </div>
          <nav class="flex flex-col gap-space-xs px-space-sm">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-secondary-container text-on-secondary-container font-semibold"
              class="flex items-center gap-space-md px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-xl">space_dashboard</span>
              <span class="font-title-md text-title-md">Dashboard Overview</span>
            </a>
            <a
              routerLink="/kanban"
              routerLinkActive="bg-secondary-container text-on-secondary-container font-semibold"
              class="flex items-center gap-space-md px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-xl">view_kanban</span>
              <span class="font-title-md text-title-md">Kanban Board</span>
            </a>
            <a
              routerLink="/task-list"
              routerLinkActive="bg-secondary-container text-on-secondary-container font-semibold"
              class="flex items-center gap-space-md px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-xl">table_chart</span>
              <span class="font-title-md text-title-md">Task List</span>
            </a>
            <a
              routerLink="/settings"
              routerLinkActive="bg-secondary-container text-on-secondary-container font-semibold"
              class="flex items-center gap-space-md px-space-md py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-xl">settings</span>
              <span class="font-title-md text-title-md">Settings</span>
            </a>
          </nav>
        </div>

        <!-- Sidebar Footer: Sprint Capacity Gauge & Logout -->
        <div class="px-space-md flex flex-col gap-space-md pt-space-lg border-t border-surface-container">
          <div class="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
            <div class="flex items-center justify-between">
              <span class="font-label-md text-label-md text-on-surface font-medium">Sprint Capacity</span>
              <span class="font-label-md text-label-md text-primary font-semibold">{{ capacityPct() }}%</span>
            </div>
            <div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-300" [style.width.%]="capacityPct()"></div>
            </div>
            <div class="flex items-center justify-between text-on-surface-variant">
              <span class="font-label-sm text-label-sm">{{ allocatedSP() }} / {{ limitSP() }} pts</span>
              <span class="font-label-sm text-label-sm">{{ remainingSP() }} pts left</span>
            </div>
          </div>

          <button
            (click)="logout()"
            class="flex items-center gap-space-md px-space-md py-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors cursor-pointer"
            type="button">
            <span class="material-symbols-outlined text-lg">logout</span>
            <span class="font-title-md text-title-md">Log out</span>
          </button>
        </div>
      </aside>

      <!-- Main Layout Body -->
      <div class="pl-64 flex flex-col min-h-screen pt-16">
        
        <!-- Breadcrumb & Fast Nav Bar (Matching Stitch templates) -->
        <div class="sticky top-16 z-30 h-12 bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-surface-container flex items-center justify-between px-space-xl">
          <div class="flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md">
            <span class="hover:text-on-surface cursor-pointer" routerLink="/dashboard">Engineering</span>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
            <span class="hover:text-on-surface cursor-pointer" routerLink="/kanban">Core Platform</span>
            <span class="material-symbols-outlined text-sm">chevron_right</span>
            <span class="text-on-surface font-semibold">Sprint 24 Board</span>
          </div>

          <nav class="flex items-center gap-space-xs p-1 rounded-lg bg-surface-container-low">
            <a
              routerLink="/kanban"
              routerLinkActive="bg-surface-container text-on-surface font-semibold"
              class="px-space-md py-1 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
              Board
            </a>
            <a
              routerLink="/task-list"
              routerLinkActive="bg-surface-container text-on-surface font-semibold"
              class="px-space-md py-1 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
              List
            </a>
            <a
              routerLink="/settings"
              routerLinkActive="bg-surface-container text-on-surface font-semibold"
              class="px-space-md py-1 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer">
              Settings
            </a>
          </nav>
        </div>

        <!-- Routed Feature View Area -->
        <main class="w-full flex-1 bg-background">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  capacityPct = signal<number>(0);
  allocatedSP = signal<number>(0);
  limitSP = signal<number>(40);
  remainingSP = signal<number>(40);

  currentUserEmail = signal<string>('admin@test.com');
  userInitials = signal<string>('AD');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.email) {
      this.currentUserEmail.set(user.email);
      this.userInitials.set(user.email.substring(0, 2).toUpperCase());
    }

    this.refreshSprintCapacity();
  }

  refreshSprintCapacity(): void {
    this.dashboardService.getSummary().subscribe({
      next: (res) => {
        if (res.data) {
          const cw = res.data.currentWeek;
          const set = res.data.settings;
          this.allocatedSP.set(cw.allocatedWeekSP);
          this.limitSP.set(set.weekly_sp_limit);
          this.remainingSP.set(cw.remainingWeekSP);
          this.capacityPct.set(cw.utilizationPercent);
        }
      }
    });
  }

  openNewTaskDialog(): void {
    const ref = this.dialog.open(TaskDialogComponent, {
      data: { defaultStatus: 'Backlog' }
    });

    ref.afterClosed().subscribe(created => {
      if (created) {
        this.refreshSprintCapacity();
        // If on kanban or task-list, the route component can listen or reload
        window.dispatchEvent(new CustomEvent('taskboard:task-updated'));
      }
    });
  }

  onSearch(event: any): void {
    const query = event.target.value;
    this.router.navigate(['/task-list'], { queryParams: { q: query } });
  }

  logout(): void {
    this.authService.logout();
  }
}

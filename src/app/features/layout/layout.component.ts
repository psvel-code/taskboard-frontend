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
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  isMobileSidebarOpen = signal<boolean>(false);
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

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}

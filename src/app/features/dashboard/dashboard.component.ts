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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
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

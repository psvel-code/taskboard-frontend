export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Backlog' | 'Planned' | 'In Progress' | 'Completed';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  story_points: number;
  priority: TaskPriority;
  status: TaskStatus;
  planned_date: string;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  id: number;
  daily_sp_limit: number;
  weekly_sp_limit: number;
  updated_at?: string;
}

export interface DashboardSummary {
  totalTasks: number;
  backlogTasks: number;
  plannedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalStoryPoints: number;
  settings: {
    daily_sp_limit: number;
    weekly_sp_limit: number;
  };
  currentWeek: {
    weekStart: string;
    weekEnd: string;
    allocatedWeekSP: number;
    remainingWeekSP: number;
    utilizationPercent: number;
  };
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface CapacityErrorResponse {
  success: boolean;
  code: 'CAPACITY_EXCEEDED';
  message: string;
  remainingDaily: number;
  remainingWeekly: number;
  dailyLimit: number;
  weeklyLimit: number;
}

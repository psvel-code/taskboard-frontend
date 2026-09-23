import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="w-full min-h-screen flex items-center justify-center p-gutter bg-background">
      <div class="flex flex-col w-full">
        <div class="w-full max-w-7xl mx-auto rounded-xl shadow-xl overflow-hidden bg-surface-container-lowest flex flex-col lg:flex-row my-auto">
          
          <!-- Left Brand Hero Card (45% on desktop) -->
          <div class="lg:w-[45%] relative bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#312E81] text-on-primary p-space-xl lg:p-12 flex flex-col justify-between overflow-hidden">
            <!-- Decorative Architectural Grid & Ambient Glow -->
            <div class="absolute inset-0 opacity-15 pointer-events-none"
                 style="background-image: radial-gradient(circle at 1px 1px, #C7D2FE 1px, transparent 0); background-size: 24px 24px;">
            </div>
            <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-container opacity-30 blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-secondary-container opacity-20 blur-3xl pointer-events-none"></div>
            
            <!-- Top Section: Logo & System Identity -->
            <div class="relative z-10 flex flex-col space-y-space-lg">
              <div class="flex items-center space-x-space-md">
                <div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm font-headline-sm font-bold">
                  TB
                </div>
                <div class="flex flex-col">
                  <span class="font-headline-sm text-headline-sm text-surface-container-lowest tracking-tight">TaskBoard</span>
                  <span class="font-label-sm text-label-sm uppercase tracking-widest text-on-primary-container">Enterprise Core</span>
                </div>
              </div>
              
              <div class="pt-6">
                <span class="inline-flex items-center space-x-space-xs px-3 py-1 rounded-full bg-surface-container-lowest/10 backdrop-blur-md text-on-primary-container font-label-sm text-label-sm">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>v4.18 Enterprise Release</span>
                </span>
                <h1 class="mt-4 font-headline-xl text-headline-xl text-surface-container-lowest leading-tight">
                  Real-time velocity &amp; intelligent capacity forecasting for agile teams.
                </h1>
                <p class="mt-3 font-body-md text-body-md text-surface-variant/80 max-w-md">
                  Unify high-throughput sprint governance, automated story point calibration, and deep engineering analytics in one unified workspace.
                </p>
              </div>

              <!-- 3 Feature Callout Badges -->
              <div class="pt-4 flex flex-col space-y-space-sm">
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-surface-container-lowest/5 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-lowest/10">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center text-on-primary">
                    <span class="material-symbols-outlined text-[18px]">token</span>
                  </div>
                  <span class="font-title-md text-title-md text-surface-container-lowest">Angular Material 3 design tokens</span>
                </div>
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-surface-container-lowest/5 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-lowest/10">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center text-on-primary">
                    <span class="material-symbols-outlined text-[18px]">speed</span>
                  </div>
                  <span class="font-title-md text-title-md text-surface-container-lowest">Automatic story point workload alerts</span>
                </div>
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-surface-container-lowest/5 backdrop-blur-sm shadow-sm transition-all hover:bg-surface-container-lowest/10">
                  <div class="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center text-on-primary">
                    <span class="material-symbols-outlined text-[18px]">sync_alt</span>
                  </div>
                  <span class="font-title-md text-title-md text-surface-container-lowest">Instant Jira &amp; GitHub bi-directional sync</span>
                </div>
              </div>
            </div>

            <!-- Bottom Testimonial Mat-Card Style -->
            <div class="relative z-10 mt-8 pt-6">
              <div class="bg-surface-container-lowest/10 backdrop-blur-md rounded-xl p-space-md shadow-md">
                <div class="flex items-start space-x-space-sm">
                  <span class="material-symbols-outlined text-secondary-fixed text-2xl leading-none">format_quote</span>
                  <div class="space-y-2">
                    <p class="font-body-md text-body-md italic text-surface-container-lowest">
                      “TaskBoard saved our sprint delivery rate by 34% within the first month.”
                    </p>
                    <div class="flex items-center justify-between pt-1">
                      <div>
                        <div class="font-title-md text-title-md text-surface-container-lowest">Sarah Lin</div>
                        <div class="font-label-sm text-label-sm text-surface-variant">VP of Engineering, NexaCore Systems</div>
                      </div>
                      <div class="flex items-center space-x-1 text-emerald-400 font-label-sm text-label-sm bg-emerald-950/40 px-2 py-0.5 rounded">
                        <span class="material-symbols-outlined text-sm">trending_up</span>
                        <span>+34%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Authentication Form (55% on desktop) -->
          <div class="lg:w-[55%] bg-surface p-space-lg lg:p-14 flex items-center justify-center">
            <div class="w-full max-w-md bg-surface-container-lowest p-space-xl sm:p-10 rounded-xl shadow-md flex flex-col">
              <!-- Header -->
              <div class="mb-space-lg">
                <div class="flex items-center justify-between">
                  <h2 class="font-headline-md text-headline-md text-on-surface font-semibold">Sign in to your workspace</h2>
                  <span class="material-symbols-outlined text-outline text-xl">corporate_fare</span>
                </div>
                <p class="font-body-md text-body-md text-secondary mt-1">
                  Enter your enterprise single sign-on or corporate credentials
                </p>
              </div>

              <!-- Quick Demo Credentials Banner -->
              <div class="mb-space-md p-space-sm bg-surface-container-low rounded-lg border border-outline-variant/40 flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="font-label-sm text-label-sm text-on-surface font-semibold">Demo Credentials:</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant font-mono">admin&#64;test.com / Admin&#64;123</span>
                </div>
                <button type="button" (click)="fillDemoCredentials()" class="text-primary hover:underline font-label-sm text-label-sm font-semibold">
                  Auto Fill
                </button>
              </div>

              @if (errorMessage()) {
                <div class="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container font-label-md flex items-center gap-2">
                  <span class="material-symbols-outlined text-error text-lg">error</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Form -->
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-space-md">
                <!-- Work Email -->
                <div class="flex flex-col space-y-1">
                  <label class="font-title-md text-title-md text-on-surface" for="work-email">Work Email address</label>
                  <div class="relative flex items-center bg-surface-container-lowest rounded-lg shadow-sm focus-within:shadow-md transition-shadow">
                    <span class="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">mail</span>
                    <input
                      formControlName="email"
                      class="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all"
                      id="work-email" placeholder="name@company.com" required type="email" />
                  </div>
                  @if (loginForm.get('email')?.touched && loginForm.get('email')?.invalid) {
                    <span class="font-label-sm text-label-sm text-error pl-1">Please enter a valid work email address</span>
                  }
                </div>

                <!-- Password with toggle -->
                <div class="flex flex-col space-y-1">
                  <div class="flex justify-between items-center">
                    <label class="font-title-md text-title-md text-on-surface" for="work-password">Password</label>
                  </div>
                  <div class="relative flex items-center bg-surface-container-lowest rounded-lg shadow-sm focus-within:shadow-md transition-shadow">
                    <span class="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">lock</span>
                    <input
                      formControlName="password"
                      class="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none transition-all"
                      id="work-password" placeholder="Enter corporate key" required [type]="showPassword() ? 'text' : 'password'" />
                    <button
                      type="button"
                      (click)="togglePasswordVisibility()"
                      class="absolute right-3 text-secondary hover:text-on-surface flex items-center justify-center p-1 rounded focus:outline-none"
                      aria-label="Toggle password visibility">
                      <span class="material-symbols-outlined text-[19px]">
                        {{ showPassword() ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Options Row -->
                <div class="flex items-center justify-between pt-1">
                  <label class="flex items-center space-x-2 cursor-pointer select-none">
                    <input checked class="w-4 h-4 rounded bg-surface-container-high text-primary-container focus:ring-0 focus:outline-none cursor-pointer" type="checkbox" />
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Remember this device</span>
                  </label>
                  <span class="font-title-md text-title-md text-primary hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                <!-- Primary CTA Button -->
                <div class="pt-2">
                  <button
                    [disabled]="isLoading() || loginForm.invalid"
                    class="w-full h-11 bg-primary-container hover:bg-primary disabled:opacity-50 text-on-primary rounded-lg font-title-md text-title-md shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
                    type="submit">
                    @if (isLoading()) {
                      <svg class="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating...</span>
                    } @else {
                      <span>Sign In to Workspace</span>
                      <span class="px-1.5 py-0.5 rounded bg-surface-container-lowest/20 font-label-sm text-label-sm text-on-primary">↵</span>
                    }
                  </button>
                </div>
              </form>

              <!-- Enterprise Compliance Footer -->
              <div class="mt-space-lg pt-space-md bg-surface-container-low rounded-lg p-space-sm flex items-start space-x-2">
                <span class="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">verified_user</span>
                <p class="font-label-sm text-label-sm text-secondary leading-relaxed">
                  Protected by <span class="font-semibold text-on-surface-variant">SOC2 Type II</span> &amp; <span class="font-semibold text-on-surface-variant">GDPR</span> standards. Authenticated with JWT session token.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['admin@test.com', [Validators.required, Validators.email]],
    password: ['Admin@123', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  fillDemoCredentials(): void {
    this.loginForm.setValue({
      email: 'admin@test.com',
      password: 'Admin@123'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }
}

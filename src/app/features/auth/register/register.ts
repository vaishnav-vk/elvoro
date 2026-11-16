import { Component,inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl,FormGroup,ReactiveFormsModule,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { Router,RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { finalize,timeout } from 'rxjs';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
}

@Component({
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
    private authService = inject(AuthService);
  private router = inject(Router);
private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  errorMessage = '';
  loading = false;

  showPassword = false;
  showConfirmPassword = false;

  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      
       Validators.pattern(/^[a-zA-Z ]+$/)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
       Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),
    confirmPassword: new FormControl('', [
      Validators.required
    ])
  }, {
    validators: passwordMatchValidator
  });

  clearError(): void {
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  onRegister(): void {

    if (this.loading) return;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const userData = {
      name: this.registerForm.value.name!.trim(),
      email: this.registerForm.value.email!.trim().toLowerCase(),
      password: this.registerForm.value.password!,
      role: 'user' as const
    };

    this.authService.register(userData).pipe(

      timeout(10000),

      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })

    ).subscribe({

      next: () => {
        this.errorMessage = '';
        this.cdr.markForCheck();
        this.router.navigate(['/login']);
      },

      error: (error) => {

        console.error('Registration error:', error);

        if (error.name === 'TimeoutError') {
          this.errorMessage =
            'Request timed out. Please check your server.';
        } else {
          this.errorMessage =
            error.error?.message ||
            error.message ||
            'Registration failed. Please try again.';
        }

        this.cdr.markForCheck();
      }

    });
  }
}

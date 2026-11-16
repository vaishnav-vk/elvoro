import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';
import { NotificationServices } from '../../../core/services/shared/notification';
import { FormControl,FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';

@Component({
  imports: [CommonModule,RouterLink,ReactiveFormsModule],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
   private authService = inject(AuthService);
  private notificationService = inject(NotificationServices);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  showLogoutConfirmation = false;

  isEditing = false;
  loading = false;

  profileForm = new FormGroup({
    name: new FormControl(this.currentUser?.name ?? '', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl(this.currentUser?.email ?? '', [
      Validators.required,
      Validators.email
    ])
  });

  get initials(): string {
    return (this.currentUser?.name ?? 'U')
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  editProfile(): void {
    this.profileForm.patchValue({
      name: this.currentUser?.name ?? '',
      email: this.currentUser?.email ?? ''
    });

    this.isEditing = true;
  }

  cancelEdit(): void {
    this.profileForm.reset({
      name: this.currentUser?.name ?? '',
      email: this.currentUser?.email ?? ''
    });

    this.isEditing = false;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.currentUser?.id) {
      this.notificationService.show(
        'Unable to identify your account.',
        'error'
      );
      return;
    }

    this.loading = true;

    const updatedData = {
      name: this.profileForm.value.name!,
      email: this.profileForm.value.email!
    };

    this.authService.updateProfile(
      this.currentUser.id,
      updatedData
    ).subscribe({
      next: (updatedUser) => {
        this.loading = false;
        this.currentUser = updatedUser;
        this.isEditing = false;

        this.notificationService.show(
          'Your profile has been updated successfully.',
          'success'
        );
      },
      error: () => {
        this.loading = false;

        this.notificationService.show(
          'Unable to update your profile. Please try again.',
          'error'
        );
      }
    });
  }

 confirmLogout(): void {
  this.showLogoutConfirmation = true;
}

cancelLogout(): void {
  this.showLogoutConfirmation = false;
}

logout(): void {
  this.authService.logOut();

  this.showLogoutConfirmation = false;

  this.notificationService.show(
    'You have been logged out.',
    'success'
  );

  this.router.navigate(['/products']);
}
}

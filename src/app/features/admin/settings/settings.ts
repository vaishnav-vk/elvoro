
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth';
import { AddressService,SavedAddress } from '../../../core/services/user/address';
import { FormsModule } from '@angular/forms';
import { AbstractControl,ValidationErrors,ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const password = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};


type SettingsSection =
  | 'profile'
  | 'password'
  | 'notifications'
  | 'addresses'
  | 'privacy';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {
  private authService = inject(AuthService);
  private addressService = inject(AddressService);

  activeSection: SettingsSection = 'profile';

  message = '';
  error = '';
  loading = false;

  currentUser = this.authService.currentUser;

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

  
passwordForm = new FormGroup(
  {
    currentPassword: new FormControl('', [
      Validators.required
    ]),

    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
      )
    ]),

    confirmPassword: new FormControl('', [
      Validators.required
    ])
  },
  {
    validators: passwordMatchValidator
  }
);


  notifications = {
    orderUpdates: true,
    promotionalEmails: false,
    newArrivals: true,
    offers: true
  };

  addresses: SavedAddress[] = [];
  showAddressForm = false;
  editingAddress: SavedAddress | null = null;

  addressForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z ]+$/)

    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[6-9]\d{9}$/)
    ]),
    address: new FormControl('',[
      Validators.required,
      Validators.minLength(10)
    ]),
    city: new FormControl('',[
      Validators.required,
      Validators.pattern(/^[a-zA-Z ]+$/)

    ]),
    state: new FormControl('',[
      Validators.required,
      Validators.pattern(/^[a-zA-Z ]+$/)

    ]),
    pinCode: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])
  });

  ngOnInit(): void {
    this.loadNotifications();
    this.loadAddresses();
  }

  selectSection(section: SettingsSection): void {
    this.activeSection = section;
    this.message = '';
    this.error = '';
  }

  saveProfile(): void {
  if (this.profileForm.invalid) {
    this.profileForm.markAllAsTouched();
    return;
  }

  const userId = this.currentUser?.id;

  if (userId === undefined || userId === null) {
    this.error = 'Please log in again.';
    return;
  }

  const formValue = this.profileForm.getRawValue();

  const profileData = {
    name: formValue.name ?? '',
    email: formValue.email ?? ''
  };

  this.loading = true;

  this.authService.updateProfile(userId, profileData).subscribe({
    next: updatedUser => {
      this.currentUser = updatedUser;
      this.loading = false;
      this.message = 'Profile updated successfully!';
    },
    error: error => {
      console.error(error);
      this.loading = false;
      this.error = 'Unable to update profile.';
    }
  });
}
  loadNotifications(): void {
    const saved = localStorage.getItem('elvoroNotifications');

    if (saved) {
      this.notifications = {
        ...this.notifications,
        ...JSON.parse(saved)
      };
    }
  }

  saveNotifications(): void {
    localStorage.setItem(
      'elvoroNotifications',
      JSON.stringify(this.notifications)
    );

    this.message = 'Notification preferences saved!';
  }

  loadAddresses(): void {
    const userId = this.currentUser?.id;

    if (userId === undefined || userId === null) return;

    this.addressService.getAddress(userId).subscribe({
      next: addresses => this.addresses = addresses,
      error: () => this.error = 'Unable to load addresses.'
    });
  }

  openNewAddress(): void {
    this.editingAddress = null;
    this.addressForm.reset();
    this.showAddressForm = true;
  }

  editAddress(address: SavedAddress): void {
    this.editingAddress = address;

    this.addressForm.patchValue({
      fullName: address.fullName,
      email: address.email,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pinCode: address.pinCode
    });

    this.showAddressForm = true;
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const userId = this.currentUser?.id;

    if (userId === undefined || userId === null) return;

    const formValue = this.addressForm.getRawValue();

const data: Omit<SavedAddress, 'id'> = {
  userId: userId,
  fullName: formValue.fullName ?? '',
  email: formValue.email ?? '',
  phone: formValue.phone ?? '',
  address: formValue.address ?? '',
  city: formValue.city ?? '',
  state: formValue.state ?? '',
  pinCode: formValue.pinCode ?? ''
};

    const request = this.editingAddress?.id !== undefined
      ? this.addressService.updateAddress(
          this.editingAddress.id,
          data
        )
      : this.addressService.saveAddress(data);

    request.subscribe({
      next: () => {
        this.showAddressForm = false;
        this.editingAddress = null;
        this.message = 'Address saved successfully!';
        this.loadAddresses();
      },
      error: () => this.error = 'Unable to save address.'
    });
  }

  deleteAddress(address: SavedAddress): void {
    if (address.id === undefined) return;

    if (!window.confirm('Delete this address?')) return;

    this.addressService.deleteAddress(address.id).subscribe({
      next: () => {
        this.message = 'Address deleted successfully!';
        this.loadAddresses();
      },
      error: () => this.error = 'Unable to delete address.'
    });
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  savePassword(): void {

  if (this.passwordForm.invalid) {
    this.passwordForm.markAllAsTouched();
    return;
  }

  const {
    currentPassword,
    newPassword,
    confirmPassword
  } = this.passwordForm.getRawValue();

  if (newPassword !== confirmPassword) {
    return;
  }

  // Form validation passed.
  // Actual password change requires a secure backend API.
  this.error = 'Password change API is not connected yet.';
}

  logout(): void {
    if (!window.confirm('Are you sure you want to log out?')) return;

    this.authService.logOut();
  }

  deleteAccount(): void {
    this.error =
      'Account deletion needs a protected backend endpoint. It is not connected yet.';
  }
}

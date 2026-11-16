
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  map,
  switchMap,
  throwError,
  timer,
  Subscription,
  catchError,
  of
} from 'rxjs';

import {
  User,
  SafeUser,
  UserStatus
} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/users';

  private currentUserSubject =
    new BehaviorSubject<SafeUser | null>(
      this.getSavedUser()
    );

  currentUser$ = this.currentUserSubject.asObservable();

  // Subscription for automatic account-status checking
  private statusCheckSubscription?: Subscription;

  constructor(private http: HttpClient) {

    // Start monitoring if a user is already logged in
    const user = this.currentUser;

    if (user) {
      this.startStatusMonitoring(user);
    }
  }

  // Get saved user from the current browser tab
  private getSavedUser(): SafeUser | null {

    try {
      const savedUser = sessionStorage.getItem('elvoroUser');

      return savedUser
        ? JSON.parse(savedUser) as SafeUser
        : null;

    } catch (error) {
      console.error('Error reading saved user:', error);
      return null;
    }
  }

  // Get current logged-in user
  get currentUser(): SafeUser | null {
    return this.currentUserSubject.value;
  }

  // Check login status
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  // Save user session in this tab
  private setCurrentUser(user: SafeUser): void {

    sessionStorage.setItem(
      'elvoroUser',
      JSON.stringify(user)
    );

    this.currentUserSubject.next(user);

    // Start monitoring customer status
    this.startStatusMonitoring(user);
  }

  // Automatically check whether customer is blocked
  private startStatusMonitoring(user: SafeUser): void {

    // Stop previous monitoring
    this.statusCheckSubscription?.unsubscribe();

    // Monitor only customer accounts
    if (user.role !== 'user') {
      return;
    }

    // Check backend every 5 seconds
    this.statusCheckSubscription = timer(0, 5000).pipe(

      switchMap(() =>
        this.http.get<User>(
          `${this.apiUrl}/${user.id}`
        ).pipe(

          catchError(error => {
            console.error('Account status check failed:', error);
            return of(null);
          })

        )
      )

    ).subscribe(latestUser => {

      // If customer is blocked, log out automatically
      if (latestUser?.status === 'blocked') {

        alert(
          'Your account has been blocked by the administrator.'
        );

        this.logOut();

        window.location.href = '/login';
      }

    });
  }

  // Register new user
  register(userData: Omit<User, 'id'>): Observable<SafeUser> {

    return this.http.get<User[]>(
      `${this.apiUrl}?email=${encodeURIComponent(userData.email)}`
    ).pipe(

      switchMap(users => {

        if (users.length > 0) {
          return throwError(() =>
            new Error('Email is already registered.')
          );
        }

        const newUser: Omit<User, 'id'> = {
          ...userData,
          status: 'active'
        };

        return this.http.post<User>(
          this.apiUrl,
          newUser
        );

      }),

      map(user => {

        const safeUser: SafeUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status ?? 'active'
        };

        this.setCurrentUser(safeUser);

        return safeUser;
      })

    );
  }

  // Login existing user
  login(email: string, password: string): Observable<SafeUser> {

    return this.http.get<User[]>(
      `${this.apiUrl}?email=${encodeURIComponent(email)}`
    ).pipe(

      map(users => {

        const user = users.find(
          item => item.password === password
        );

        if (!user) {
          throw new Error('Invalid email or password.');
        }

        // Check whether the account is blocked
        if (user.status === 'blocked') {
          throw new Error(
            'Your account has been blocked. Please contact the administrator.'
          );
        }

        const safeUser: SafeUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status ?? 'active'
        };

        this.setCurrentUser(safeUser);

        return safeUser;
      })

    );
  }

  // Logout only this tab
  logOut(): void {

    // Stop automatic status checking
    this.statusCheckSubscription?.unsubscribe();
    this.statusCheckSubscription = undefined;

    // Remove only this tab's login session
    sessionStorage.removeItem('elvoroUser');

    this.currentUserSubject.next(null);
  }

  // Update profile
  updateProfile(
    userId: string | number,
    data: Partial<Pick<SafeUser, 'name' | 'email'>>
  ): Observable<SafeUser> {

    return this.http.patch<User>(
      `${this.apiUrl}/${userId}`,
      data
    ).pipe(

      map(updatedUser => {

        const safeUser: SafeUser = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status ?? 'active'
        };

        // Update session and BehaviorSubject
        this.setCurrentUser(safeUser);

        return safeUser;
      })

    );
  }

  // Get all customers (exclude admin accounts)
  getAllCustomers(): Observable<SafeUser[]> {

    return this.http.get<User[]>(this.apiUrl).pipe(

      map(users =>
        users
          .filter(user => user.role === 'user')
          .map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status ?? 'active'
          }))
      )

    );
  }

  // Block or unblock a customer
  updateUserStatus(
    userId: string | number,
    status: UserStatus
  ): Observable<User> {

    return this.http.patch<User>(
      `${this.apiUrl}/${userId}`,
      { status }
    );
  }

}

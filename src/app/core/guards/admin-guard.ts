import { CanActivateFn,Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth';
export const adminGuard: CanActivateFn = (route, state) => {
  const authService=inject(AuthService)
  const router=inject(Router)

  const user=authService.currentUser;

  if(!user){
    return router.createUrlTree(['/login'])
  }

   if (user.role !== 'admin') {
    return router.createUrlTree(['/']);
  }

  return true

};

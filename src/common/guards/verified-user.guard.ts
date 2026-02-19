import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class VerifiedUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenException(
        'Your account must be verified to perform this action',
      );
    }
    return true;
  }
}
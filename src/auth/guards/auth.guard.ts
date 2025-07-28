import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.session || !request.session.userId) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const user = await this.userService.findById(request.session.userId);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }
}

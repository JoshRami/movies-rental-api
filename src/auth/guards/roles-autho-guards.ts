import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';

export class AdminsGuard implements CanActivate {
  constructor(
    @Inject('UsersService') private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    await this.usersService.verifyAdmin(user.id);
    return true;
  }
}

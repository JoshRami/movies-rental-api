import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';

import { TokensService } from 'src/tokens/tokens.service';

export class WhitelistGuard implements CanActivate {
  constructor(
    @Inject('TokensService') private readonly tokensService: TokensService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.get('Authorization')?.split(' ')[1];
    await this.tokensService.checkToken(accessToken);
    return true;
  }
}

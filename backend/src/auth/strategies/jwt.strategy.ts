import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersDao } from '../../users/dao/users.dao';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersDao: UsersDao,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'local-dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersDao.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

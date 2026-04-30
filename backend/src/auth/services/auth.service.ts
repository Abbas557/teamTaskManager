import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { UsersDao } from '../../users/dao/users.dao';
import { LoginDto } from '../dto/login.dto';
import { SignupDto } from '../dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersDao: UsersDao,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersDao.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const usersCount = await this.usersDao.count();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersDao.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: usersCount === 0 ? UserRole.ADMIN : UserRole.MEMBER,
    });

    return this.authResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersDao.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return this.authResponse(safeUser);
  }

  async me(user: AuthUser) {
    const found = await this.usersDao.findById(user.id);
    if (!found) {
      throw new UnauthorizedException('Invalid token');
    }
    return found;
  }

  private authResponse(user: { id: string; name: string; email: string; role: UserRole }) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user,
    };
  }
}

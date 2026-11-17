import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(email: string, password: string, tenantName: string = null) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant if not provided (personal account)
    let tenant = await this.prisma.tenant.findFirst({
      where: { name: tenantName || email.split('@')[0] },
    });
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: tenantName || email.split('@')[0],
          type: 'personal',
          owner: { create: {} }, // Temp, will update below
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        tenantId: tenant.id,
        role: 'user',
      },
    });

    // Update tenant owner
    await this.prisma.tenant.update({
      where: { id: tenant.id },
      data: { ownerId: user.id },
    });

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId };
    const accessToken = this.jwt.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
    return { user: { id: user.id, email: user.email, tenantId: user.tenantId }, accessToken, refreshToken };
  }
}

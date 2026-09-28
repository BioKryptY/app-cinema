import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload { sub: number; email: string; }

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Busca o usuário pelo e-mail
    const user = await this.usersService.findByEmail(loginDto.email);

    // Compara a senha digitada com o hash salvo no banco
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    // Define o conteúdo do token
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload), // Gera o JWT assinado
    };
  }
}
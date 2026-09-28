import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Nunca devolver a senha (nem criptografada) nas respostas da API
const semSenha = { password: true } as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    return this.prisma.user.create({
      data: { ...createUserDto, password: hash},
      omit: semSenha,
    });
  }

  // Único que devolve a senha: o login precisa dela para comparar
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findAll() {
    return this.prisma.user.findMany({ omit: semSenha });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: semSenha,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Se trocar a senha, salva criptografada, igual ao cadastro (senão o login para de funcionar)
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: semSenha,
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      omit: semSenha,
    });
  }
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty  } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty({
        description: 'O endereço de e-mail do usuario',
        example: 'usuario@email.com'
    })
    @IsEmail()
    email!: string;

    @ApiProperty({ 
        description: 'O nome completo do usuário', 
        example: 'João Silva' 
      })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ 
        description: 'A senha de acesso do usuário (mínimo de 6 caracteres)', 
        example: 'senhaSegura123',
        minLength: 6,
        format: 'password'
      })
    @IsString()
    @MinLength(6)
    password!: string;
}
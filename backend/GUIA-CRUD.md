# Guia: CRUD do CineWeb no backend (sem integrar com o frontend)

O `schema.prisma` já tem todas as tabelas e a migration `tabelas_cinema` já as cria no banco. O trabalho é só criar os módulos no NestJS, seguindo o mesmo jeito do `users` e do `auth`.

## 0. O que vamos criar

O frontend já chama estes endereços (veja `frontend-web/src/services/api.ts`). O backend vai usar **os mesmos nomes**, assim na hora de integrar basta trocar a URL:

| Recurso | Rota | Extra |
|---|---|---|
| Salas | `/salas` | — |
| Filmes | `/filmes` | — |
| Lanches e Combos | `/lanchesCombos` | — |
| Sessões | `/sessoes` | usa filme e sala |
| Ingressos | `/ingressos` | filtro `?sessaoId=` e `?pedidoId=` |
| Pedidos | `/pedidos` | leva a lista de lanches junto, filtro `?sessaoId=` |

Cada recurso tem 5 rotas: `POST` (criar), `GET` (listar), `GET /:id` (buscar um), `PUT /:id` (atualizar), `DELETE /:id` (excluir).

> **Por que `PUT` e não `PATCH` como no users?** O frontend usa `PUT` para atualizar. Se usarmos `PATCH`, na hora de integrar dá erro 404.

**A ordem importa:** primeiro o que não depende de nada (Salas, Filmes, Lanches) e depois o que depende (Sessões → Ingressos → Pedidos).

### Quais rotas precisam de login (token JWT)

Nem toda rota precisa de login. Pense no cinema de verdade: qualquer pessoa pode ver os filmes em cartaz e os horários, mas só o funcionário pode mudar o cadastro ou registrar uma venda.

| Recurso | Consultar (`GET`) | Criar, editar, excluir (`POST`, `PUT`, `DELETE`) |
|---|---|---|
| Salas, Filmes, Lanches e Combos, Sessões | **aberto** | precisa de login |
| Ingressos, Pedidos | precisa de login | precisa de login |

Por que ingressos e pedidos ficam fechados até para consulta? Eles são o registro das vendas (quanto foi vendido, quando e por quanto). Isso é informação interna do cinema, não da vitrine.

Na prática:
- **Salas, Filmes, Lanches e Sessões:** a proteção vai **só em cima do `POST`, do `PUT` e do `DELETE`**, rota por rota, igual ao `users`.
- **Ingressos e Pedidos:** a proteção vai **uma vez só, em cima da classe**, e vale para todas as rotas.

---

## 1. Preparação (uma vez só)

Todos os comandos rodam **dentro da pasta `backend`**.

### 1.1 — Banco e Prisma em dia

```bash
npx prisma migrate dev      # aplica as migrations no seu banco (se já rodou, ele só avisa)
npx prisma generate         # gera o código do Prisma com as tabelas novas
```

### 1.2 — Ajuste no `main.ts`

Troque a linha do `ValidationPipe` e adicione as tags novas no Swagger:

```ts
// whitelist: descarta campos que não estão no DTO (ex.: o "id" que o frontend manda junto)
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

const config = new DocumentBuilder()
  .setTitle('Documentação da API - CineWeb')
  .setDescription('CineWeb - API')
  .setVersion('1.0')
  .addTag('users')
  .addTag('auth')
  .addTag('salas')
  .addTag('filmes')
  .addTag('lanchesCombos')
  .addTag('sessoes')
  .addTag('ingressos')
  .addTag('pedidos')
  .addBearerAuth(/* ... deixa igual está ... */)
  .build();
```

---

## 2. Salas (o modelo para todos os outros)

Faça esse com calma: os outros seguem a mesma receita.

### 2.1 — Gerar os arquivos

```bash
npx nest g resource salas --no-spec
```

Ele pergunta duas coisas:

- *What transport layer do you use?* → **REST API**
- *Would you like to generate CRUD entry points?* → **Yes**

Ele cria a pasta `src/salas/` e já registra o `SalasModule` no `app.module.ts` (vale conferir). O `--no-spec` evita criar arquivos de teste que quebrariam o `npm test`, porque não sabem do Prisma.

Agora **substitua o conteúdo** de cada arquivo pelo código abaixo.

### 2.2 — `src/salas/dto/create-sala.dto.ts`: o formato dos dados que chegam

As regras são as mesmas do `salaSchema` do frontend:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateSalaDto {
  @ApiProperty({ description: 'Número da sala', example: 1 })
  @IsInt()
  @IsPositive()
  numero!: number;

  @ApiProperty({ description: 'Quantidade de lugares', example: 120 })
  @IsInt()
  @IsPositive()
  capacidade!: number;
}
```

### 2.3 — `src/salas/dto/update-sala.dto.ts`

```ts
import { PartialType } from '@nestjs/swagger';
import { CreateSalaDto } from './create-sala.dto';

// PartialType = mesmos campos do Create, mas todos opcionais
export class UpdateSalaDto extends PartialType(CreateSalaDto) {}
```

> O gerador escreve `from '@nestjs/mapped-types'`. **Troque para `'@nestjs/swagger'`**, senão o Swagger não mostra os campos no update.

### 2.4 — `src/salas/salas.module.ts`: igual ao do users, importando o Prisma

```ts
import { Module } from '@nestjs/common';
import { SalasService } from './salas.service';
import { SalasController } from './salas.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalasController],
  providers: [SalasService],
})
export class SalasModule {}
```

### 2.5 — `src/salas/salas.service.ts`: quem conversa com o banco

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(private prisma: PrismaService) {}

  create(createSalaDto: CreateSalaDto) {
    return this.prisma.sala.create({ data: createSalaDto });
  }

  findAll() {
    return this.prisma.sala.findMany();
  }

  async findOne(id: string) {
    const sala = await this.prisma.sala.findUnique({ where: { id } });
    // Sem isso, buscar um id que não existe devolveria vazio com status 200
    if (!sala) throw new NotFoundException('Sala não encontrada');
    return sala;
  }

  async update(id: string, updateSalaDto: UpdateSalaDto) {
    await this.findOne(id); // garante que existe (senão dá 404 em vez de erro 500)
    return this.prisma.sala.update({ where: { id }, data: updateSalaDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sala.delete({ where: { id } });
  }
}
```

> **Diferença para o users:** lá o `id` é número (`+id`). Aqui é **texto** (o `cuid()` do schema, algo como `"cm1abc..."`), então não tem `+id`.

### 2.6 — `src/salas/salas.controller.ts`: as rotas

```ts
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SalasService } from './salas.service';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@ApiTags('salas')
@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @ApiBearerAuth('token')       // mostra o cadeado no Swagger
  @UseGuards(AuthGuard('jwt'))  // só quem fez login pode alterar
  @Post()
  @ApiOperation({ summary: 'Criar uma sala' })
  @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createSalaDto: CreateSalaDto) {
    return this.salasService.create(createSalaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as salas' })
  findAll() {
    return this.salasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma sala por ID' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  findOne(@Param('id') id: string) {
    return this.salasService.findOne(id);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma sala por ID' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  update(@Param('id') id: string, @Body() updateSalaDto: UpdateSalaDto) {
    return this.salasService.update(id, updateSalaDto);
  }

  @ApiBearerAuth('token')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma sala por ID' })
  @ApiResponse({ status: 404, description: 'Sala não encontrada' })
  remove(@Param('id') id: string) {
    return this.salasService.remove(id);
  }
}
```

> Repare que os dois `GET` **não têm** `@UseGuards`: qualquer um pode consultar as salas. Só criar, editar e excluir pedem login. É o mesmo jeito do `users`, onde o cadastro (`POST /users`) fica aberto e o resto é protegido.

A pasta `entities/` que o gerador criou não é usada (o Prisma já cuida disso). Pode apagar.

---

## 3. Testar no Swagger

1. `npm run start:dev`
2. Abra `http://localhost:3000/api`
3. **`POST /users`**: crie um usuário (se ainda não tem)
4. **`POST /auth/login`**: faça login e copie o valor de `access_token`
5. Clique no botão **Authorize** (cadeado no topo), cole o token e confirme
6. Em **salas**: crie uma sala, liste, busque pelo id, atualize e exclua

Sem o passo 5, os `GET` de salas, filmes, lanches e sessões funcionam normalmente. Já criar, editar, excluir e tudo de ingressos e pedidos respondem **401**. É o sinal de que a proteção está funcionando. No Swagger, as rotas protegidas aparecem com um cadeado.

O token dura 1 hora (configurado no `auth.module.ts`). Depois disso, faça login de novo.

---

## 4. Filmes

```bash
npx nest g resource filmes --no-spec
```

### `dto/create-filme.dto.ts` (regras do `filmeSchema`)

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateFilmeDto {
  @ApiProperty({ example: 'Duna: Parte Dois' })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ example: 'Paul Atreides se une aos Fremen...' })
  @IsString()
  @MinLength(10)
  sinopse!: string;

  @ApiProperty({ example: '14' })
  @IsString()
  @IsNotEmpty()
  classificacao!: string;

  @ApiProperty({ description: 'Duração em minutos', example: 166 })
  @IsInt()
  @IsPositive()
  duracao!: number;

  @ApiProperty({ example: 'Ficção científica' })
  @IsString()
  @IsNotEmpty()
  genero!: string;

  @ApiProperty({ example: '2026-10-01' })
  @IsString()
  @IsNotEmpty()
  dataInicio!: string;

  @ApiProperty({ example: '2026-10-31' })
  @IsString()
  @IsNotEmpty()
  dataFim!: string;
}
```

### Os outros arquivos

`update-filme.dto.ts`, `filmes.module.ts`, `filmes.service.ts` e `filmes.controller.ts`: copie os de Salas trocando:

| Em Salas | Em Filmes |
|---|---|
| `this.prisma.sala` | `this.prisma.filme` |
| `Sala` / `sala` nos nomes (`CreateSalaDto`, `SalasService`...) | `Filme` / `filme` (`CreateFilmeDto`, `FilmesService`...) |
| `@ApiTags('salas')` e `@Controller('salas')` | `'filmes'` |
| `'Sala não encontrada'` | `'Filme não encontrado'` |

---

## 5. Lanches e Combos

```bash
npx nest g resource lanches-combos --no-spec
```

> ⚠️ O gerador cria a rota `'lanches-combos'`, mas o frontend usa **`lanchesCombos`**. No controller, deixe `@Controller('lanchesCombos')` e `@ApiTags('lanchesCombos')`.

### `dto/create-lanche-combo.dto.ts` (regras do `lancheComboSchema`)

O gerador pode ter criado com o nome `create-lanches-combo.dto.ts`; renomeie ou só ajuste os imports.

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateLancheComboDto {
  @ApiProperty({ example: 'Combo Casal' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'Pipoca grande + 2 refrigerantes' })
  @IsString()
  @MinLength(10)
  descricao!: string;

  @ApiProperty({ example: 45.9 })
  @IsNumber()
  @IsPositive()
  valorUnitario!: number;
}
```

O resto é igual a Salas, com `this.prisma.lancheCombo` e os nomes `LancheCombo` / `LanchesCombos`.

---

## 6. Sessões

```bash
npx nest g resource sessoes --no-spec
```

> ⚠️ O gerador erra o singular e cria `CreateSessoeDto`. Renomeie para `CreateSessaoDto` / `UpdateSessaoDto` (e os arquivos para `create-sessao.dto.ts` / `update-sessao.dto.ts`).

### `dto/create-sessao.dto.ts`

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateSessaoDto {
  @ApiProperty({ description: 'ID do filme', example: 'cole-aqui-o-id-de-um-filme' })
  @IsString()
  @IsNotEmpty()
  filmeId!: string;

  @ApiProperty({ description: 'ID da sala', example: 'cole-aqui-o-id-de-uma-sala' })
  @IsString()
  @IsNotEmpty()
  salaId!: string;

  @ApiProperty({ example: '2026-10-05T19:30' })
  @IsString()
  @IsNotEmpty()
  dataHora!: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  precoBase!: number;
}
```

### `sessoes.service.ts`

Igual ao de Salas, com uma novidade: o `include`, que já devolve os dados do filme e da sala junto com a sessão. A tela do frontend precisa disso para mostrar o nome do filme e o número da sala.

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';

@Injectable()
export class SessoesService {
  constructor(private prisma: PrismaService) {}

  create(createSessaoDto: CreateSessaoDto) {
    return this.prisma.sessao.create({ data: createSessaoDto });
  }

  findAll() {
    return this.prisma.sessao.findMany({
      include: { filme: true, sala: true },
    });
  }

  async findOne(id: string) {
    const sessao = await this.prisma.sessao.findUnique({
      where: { id },
      include: { filme: true, sala: true },
    });
    if (!sessao) throw new NotFoundException('Sessão não encontrada');
    return sessao;
  }

  async update(id: string, updateSessaoDto: UpdateSessaoDto) {
    await this.findOne(id);
    return this.prisma.sessao.update({ where: { id }, data: updateSessaoDto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.sessao.delete({ where: { id } });
  }
}
```

Controller e module: iguais aos de Salas, com rota `'sessoes'`.

**Para testar:** crie antes um filme e uma sala, copie os `id` deles e use ao criar a sessão.

---

## 7. Ingressos

```bash
npx nest g resource ingressos --no-spec
```

### `dto/create-ingresso.dto.ts`

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateIngressoDto {
  @ApiPropertyOptional({ description: 'ID do pedido (opcional)' })
  @IsOptional()
  @IsString()
  pedidoId?: string;

  @ApiProperty({ description: 'ID da sessão' })
  @IsString()
  @IsNotEmpty()
  sessaoId!: string;

  @ApiProperty({ enum: ['inteira', 'meia'], example: 'inteira' })
  @IsIn(['inteira', 'meia'])
  tipo!: 'inteira' | 'meia';

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  valorInteira!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @IsPositive()
  valorMeia!: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @IsPositive()
  valorFinal!: number;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  @IsNotEmpty()
  dataCompra!: string;
}
```

### O filtro por sessão e por pedido

O frontend busca `/ingressos?sessaoId=...` e `/ingressos?pedidoId=...`.

No **service**, só o `findAll` muda. O resto é igual a Salas, com `this.prisma.ingresso`:

```ts
findAll(sessaoId?: string, pedidoId?: string) {
  // Se o filtro não for enviado, ele fica "undefined" e o Prisma simplesmente ignora
  return this.prisma.ingresso.findMany({
    where: { sessaoId, pedidoId },
  });
}
```

No **controller**, a proteção fica **em cima da classe**, porque aqui todas as rotas pedem login, inclusive a consulta:

```ts
@ApiTags('ingressos')
@ApiBearerAuth('token')       // mostra o cadeado no Swagger
@UseGuards(AuthGuard('jwt'))  // exige token em TODAS as rotas desta classe
@Controller('ingressos')
export class IngressosController {
```

E o `findAll` passa a ler os filtros do endereço:

```ts
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
// ...

@Get()
@ApiOperation({ summary: 'Listar ingressos (pode filtrar por sessão ou pedido)' })
@ApiQuery({ name: 'sessaoId', required: false })
@ApiQuery({ name: 'pedidoId', required: false })
findAll(@Query('sessaoId') sessaoId?: string, @Query('pedidoId') pedidoId?: string) {
  return this.ingressosService.findAll(sessaoId, pedidoId);
}
```

O `@ApiQuery` com `required: false` faz o Swagger mostrar os campos de filtro como opcionais.

---

## 8. Pedidos (o mais diferente)

```bash
npx nest g resource pedidos --no-spec
```

O pedido **leva junto uma lista de lanches** (a tabela `ItemPedido`). Cada item guarda o nome e o preço **do momento da venda**, para que um reajuste no cardápio não mude pedidos antigos.

### `dto/create-pedido.dto.ts`

Dois DTOs no mesmo arquivo, um para o item e outro para o pedido:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min, ValidateNested,
} from 'class-validator';

// Um lanche dentro do pedido
export class ItemPedidoDto {
  @ApiProperty({ description: 'ID do lanche/combo' })
  @IsString()
  @IsNotEmpty()
  lancheComboId!: string;

  @ApiProperty({ example: 'Combo Casal' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 45.9 })
  @IsNumber()
  @IsPositive()
  valorUnitario!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  qtUnidade!: number;

  @ApiProperty({ example: 91.8 })
  @IsNumber()
  @IsPositive()
  subtotal!: number;
}

export class CreatePedidoDto {
  @ApiProperty({ description: 'ID da sessão' })
  @IsString()
  @IsNotEmpty()
  sessaoId!: string;

  @ApiProperty({ example: '2026-10-05' })
  @IsString()
  @IsNotEmpty()
  dataPedido!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  qtInteira!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  qtMeia!: number;

  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ValidateNested({ each: true }) // valida cada item da lista...
  @Type(() => ItemPedidoDto)      // ...usando as regras do ItemPedidoDto
  lanches!: ItemPedidoDto[];

  @ApiProperty({ example: 75 })
  @IsNumber()
  @Min(0)
  valorIngressos!: number;

  @ApiProperty({ example: 91.8 })
  @IsNumber()
  @Min(0)
  valorLanches!: number;

  @ApiProperty({ example: 166.8 })
  @IsNumber()
  @IsPositive()
  valorTotal!: number;
}
```

### `pedidos.service.ts`

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  create(createPedidoDto: CreatePedidoDto) {
    // Separa a lista de lanches do resto dos dados do pedido
    const { lanches, ...pedido } = createPedidoDto;

    return this.prisma.pedido.create({
      data: {
        ...pedido,
        lanches: { create: lanches }, // cria os itens junto, já ligados ao pedido
      },
      include: { lanches: true },     // devolve o pedido com os itens
    });
  }

  findAll(sessaoId?: string) {
    return this.prisma.pedido.findMany({
      where: { sessaoId },
      include: { lanches: true },
    });
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { lanches: true },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    return pedido;
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    await this.findOne(id);
    const { lanches, ...pedido } = updatePedidoDto;

    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...pedido,
        // Se veio uma lista nova de lanches: apaga os itens antigos e cria os novos
        lanches: lanches ? { deleteMany: {}, create: lanches } : undefined,
      },
      include: { lanches: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Os itens de lanche são apagados junto (onDelete: Cascade no schema)
    return this.prisma.pedido.delete({ where: { id } });
  }
}
```

### `pedidos.controller.ts`

Igual ao de Ingressos: rota `'pedidos'` e **proteção em cima da classe**, porque pedido é venda. O `findAll` recebe o filtro de sessão:

```ts
@Get()
@ApiOperation({ summary: 'Listar pedidos (pode filtrar por sessão)' })
@ApiQuery({ name: 'sessaoId', required: false })
findAll(@Query('sessaoId') sessaoId?: string) {
  return this.pedidosService.findAll(sessaoId);
}
```

### Exemplo de corpo para testar no Swagger

```json
{
  "sessaoId": "id-de-uma-sessao",
  "dataPedido": "2026-10-05",
  "qtInteira": 2,
  "qtMeia": 1,
  "lanches": [
    { "lancheComboId": "id-de-um-lanche", "nome": "Combo Casal", "valorUnitario": 45.9, "qtUnidade": 2, "subtotal": 91.8 }
  ],
  "valorIngressos": 75,
  "valorLanches": 91.8,
  "valorTotal": 166.8
}
```

---

## 9. Problemas comuns

| O que aparece | Por quê | Como resolver |
|---|---|---|
| **401 Unauthorized** | Faltou o token ou ele passou de 1 hora | Login de novo e clique em **Authorize** |
| `GET` de salas pedindo token | Ficou o `@UseGuards` em cima da classe | Deixe o `@UseGuards` só no `POST`, no `PUT` e no `DELETE` (seção 2.6) |
| **400 Bad Request** | Algum campo não passou na validação | A resposta diz qual campo. Confira o tipo (número sem aspas, texto com aspas) |
| **500 ao criar sessão, ingresso ou pedido** | O `filmeId`/`salaId`/`sessaoId` enviado não existe | Crie o registro antes e copie o `id` certo |
| **500 ao excluir sala, filme ou sessão** | Ainda tem sessão/ingresso/pedido usando esse registro, e o banco bloqueia | Exclua primeiro o que depende dele (o frontend já faz isso nessa ordem) |
| `Property 'sala' does not exist on PrismaService` | O Prisma não foi gerado depois do schema | `npx prisma generate` e reinicie o `start:dev` |
| Rota não aparece no Swagger | O módulo não está no `app.module.ts` | Confira se o `XxxModule` está no `imports` |

---

## 10. Commits (um por recurso)

Um commit para cada módulo, adicionando por caminho:

```bash
git add src/salas src/app.module.ts
git commit -m "feat(salas): cadastro de salas disponível na API com login obrigatório"
```

E assim para `filmes`, `lanchesCombos`, `sessoes`, `ingressos` e `pedidos`. O ajuste do `main.ts` pode ir junto do primeiro.

Antes de commitar, lembre que `backend/src/generated/` é código gerado pelo Prisma e normalmente vai no `.gitignore`.

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UuidParamDto } from './dto/uuid-param.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ValidRoles } from '../../common/auth-module/interfaces/valid-roles';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth()
  findAll() {
   return this.usersService.findAll();
  }

  @Get('organization/:organizationId')
  @Auth()
  async findByOrganization(
    @Param('organizationId') organizationId: string,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    const requesterEmail = req.user?.email;
    if (!requesterEmail) {
      throw new ForbiddenException('Unable to determine requester identity');
    }

    const requester = await this.usersService.findByUserEmail(requesterEmail);

    if (!requester || requester.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    // Return all users including the admin (user with same email as organization)
    return this.usersService.findByOrganization(organizationId);
  }

  @Get('email/:email')
  @Auth()
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get(':id')
  @Auth(ValidRoles.admin)
  findOne(@Param() params: UuidParamDto) {
    return this.usersService.findOne(params.id);
  }

  @Patch(':id')
  @Auth()
  update(@Param() params: UuidParamDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(params.id, updateUserDto);
  }

  @Patch('email/:email')
  @Auth()
  updateByEmail(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateByEmail(email, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth()
  remove(@Param() params: UuidParamDto) {
    return this.usersService.remove(params.id);
  }
}

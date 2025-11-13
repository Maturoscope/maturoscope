import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { UserInvitationService } from './user-invitation.service';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CompleteUserInvitationDto } from './dto/complete-user-invitation.dto';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';

@Controller('user-invitation')
export class UserInvitationController {
  constructor(private readonly userInvitationService: UserInvitationService) {}

  @Post('invite')
  @Auth()
  inviteUser(
    @Body() createUserInvitationDto: CreateUserInvitationDto,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    return this.userInvitationService.inviteUser(createUserInvitationDto, req.user);
  }

  @Get('verify')
  verifyInvitation(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.userInvitationService.verifyInvitationToken(token);
  }

  @Post('complete')
  completeInvitation(@Body() completeUserInvitationDto: CompleteUserInvitationDto) {
    return this.userInvitationService.completeInvitation(completeUserInvitationDto);
  }

  @Post('resend')
  @Auth()
  resendInvitation(
    @Body() createUserInvitationDto: CreateUserInvitationDto,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    return this.userInvitationService.resendInvitation(createUserInvitationDto, req.user);
  }
}


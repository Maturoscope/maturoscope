import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserInvitationService } from './user-invitation.service';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CompleteUserInvitationDto } from './dto/complete-user-invitation.dto';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';

@ApiTags('user-invitation')
@Controller('user-invitation')
export class UserInvitationController {
  constructor(private readonly userInvitationService: UserInvitationService) {}

  @Post('invite')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Invite new user',
    description: 'Sends an invitation email to a new user to join the organization.'
  })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  inviteUser(
    @Body() createUserInvitationDto: CreateUserInvitationDto,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    return this.userInvitationService.inviteUser(createUserInvitationDto, req.user);
  }

  @Get('check')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check an email before inviting',
    description:
      'Returns whether the email is new, already in the organization, or an existing user of another organization, so the UI can show the right screen.',
  })
  @ApiQuery({ name: 'email', required: true, description: 'Email to check' })
  @ApiQuery({ name: 'organizationId', required: true, description: 'Target organization UUID' })
  @ApiResponse({ status: 200, description: 'Check result' })
  @ApiResponse({ status: 400, description: 'email and organizationId are required' })
  checkInvitation(
    @Query('email') email: string,
    @Query('organizationId') organizationId: string,
  ) {
    if (!email || !organizationId) {
      throw new BadRequestException('email and organizationId are required');
    }
    return this.userInvitationService.checkInvitation(email, organizationId);
  }

  @Get('verify')
  @ApiOperation({ 
    summary: 'Verify invitation token (PUBLIC)',
    description: 'Verifies an invitation token from the email link. PUBLIC endpoint.'
  })
  @ApiQuery({ name: 'token', required: true, description: 'Invitation token from email', example: 'abc123xyz...' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Token is required' })
  @ApiResponse({ status: 404, description: 'Invalid or expired token' })
  verifyInvitation(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.userInvitationService.verifyInvitationToken(token);
  }

  @Post('complete')
  @ApiOperation({ 
    summary: 'Complete user invitation (PUBLIC)',
    description: 'Completes the invitation process by setting user password and activating account. PUBLIC endpoint.'
  })
  @ApiResponse({ status: 200, description: 'Invitation completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or data' })
  completeInvitation(@Body() completeUserInvitationDto: CompleteUserInvitationDto) {
    return this.userInvitationService.completeInvitation(completeUserInvitationDto);
  }

  @Post('resend')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Resend invitation',
    description: 'Resends an invitation email to a user.'
  })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  resendInvitation(
    @Body() createUserInvitationDto: CreateUserInvitationDto,
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    return this.userInvitationService.resendInvitation(createUserInvitationDto, req.user);
  }
}


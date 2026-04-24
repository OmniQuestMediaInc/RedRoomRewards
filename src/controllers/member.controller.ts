import { Controller, Post, Body } from '@nestjs/common';
import { MemberService } from '../services/member.service';
import { MemberSignupRequest } from '../interfaces/redroom-rewards';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('signup')
  async signup(@Body() request: MemberSignupRequest) {
    return this.memberService.signup(request);
  }
}

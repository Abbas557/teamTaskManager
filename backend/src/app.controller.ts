import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'team-task-manager-backend',
      timestamp: new Date().toISOString(),
    };
  }
}

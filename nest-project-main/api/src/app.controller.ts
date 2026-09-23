import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /** GET /api/health - used by Render (and humans) to check the API is up. */
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

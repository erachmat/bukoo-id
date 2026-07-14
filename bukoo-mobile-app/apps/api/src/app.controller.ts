import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

@Controller()
export class AppController {
  /**
   * Liveness probe — excluded from /v1 prefix in main.ts so it is reachable
   * at GET /health by Railway, Docker HEALTHCHECK, and Kubernetes probes.
   */
  @Get('health')
  @ApiOperation({ summary: 'Liveness health check', tags: ['Health'] })
  health(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}

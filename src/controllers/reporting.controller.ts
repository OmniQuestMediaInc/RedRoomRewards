import { Controller, Get } from '@nestjs/common';
import { ReportingService } from '../services/reporting.service';

@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('liability')
  async getLiability() {
    return this.reportingService.getLiabilityReport();
  }
}

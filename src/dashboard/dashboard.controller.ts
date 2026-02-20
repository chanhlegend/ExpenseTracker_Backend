import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import type { JwtUser } from '../types/jwt-user.type';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(
    @GetUser() user: JwtUser,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    return this.dashboardService.getSummary(user._id.toString(), m, y);
  }

  @Get('chart/income-expense')
  async getIncomeExpenseChart(
    @GetUser() user: JwtUser,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    return this.dashboardService.getIncomeExpenseChart(
      user._id.toString(),
      m,
      y,
    );
  }

  @Get('chart/by-category')
  async getByCategoryChart(
    @GetUser() user: JwtUser,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    return this.dashboardService.getByCategoryChart(user._id.toString(), m, y);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { TransactionType } from '../schemas/transaction.schema';
import type { JwtUser } from '../types/jwt-user.type';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @GetUser() user: JwtUser,
    @Body() createDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user._id.toString(), createDto);
  }

  @Get()
  async findAll(
    @GetUser() user: JwtUser,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('type') type?: TransactionType,
    @Query('note') note?: string,
  ) {
    return this.transactionsService.findAll(user._id.toString(), {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      type,
      note,
    });
  }

  @Get(':id')
  async findOne(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.transactionsService.findOne(user._id.toString(), id);
  }

  @Patch(':id')
  async update(
    @GetUser() user: JwtUser,
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user._id.toString(), id, updateDto);
  }

  @Delete(':id')
  async remove(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.transactionsService.remove(user._id.toString(), id);
  }
}

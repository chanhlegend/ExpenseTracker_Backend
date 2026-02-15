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

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    async create(
        @GetUser() user: any,
        @Body() createDto: CreateTransactionDto,
    ) {
        return this.transactionsService.create(user._id, createDto);
    }

    @Get()
    async findAll(
        @GetUser() user: any,
        @Query('month') month?: string,
        @Query('year') year?: string,
        @Query('type') type?: TransactionType,
        @Query('note') note?: string,
    ) {
        return this.transactionsService.findAll(user._id, {
            month: month ? parseInt(month) : undefined,
            year: year ? parseInt(year) : undefined,
            type,
            note,
        });
    }

    @Get(':id')
    async findOne(@GetUser() user: any, @Param('id') id: string) {
        return this.transactionsService.findOne(user._id, id);
    }

    @Patch(':id')
    async update(
        @GetUser() user: any,
        @Param('id') id: string,
        @Body() updateDto: UpdateTransactionDto,
    ) {
        return this.transactionsService.update(user._id, id, updateDto);
    }

    @Delete(':id')
    async remove(@GetUser() user: any, @Param('id') id: string) {
        return this.transactionsService.remove(user._id, id);
    }
}

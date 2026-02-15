import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    Transaction,
    TransactionDocument,
    TransactionType,
} from '../schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transaction.name)
        private transactionModel: Model<TransactionDocument>,
    ) { }

    async create(userId: string, createDto: CreateTransactionDto) {
        const transaction = await this.transactionModel.create({
            userId: new Types.ObjectId(userId),
            categoryId: new Types.ObjectId(createDto.categoryId),
            type: createDto.type,
            amount: createDto.amount,
            date: new Date(createDto.date),
            note: createDto.note || '',
        });
        return transaction.populate('categoryId');
    }

    async findAll(
        userId: string,
        query: {
            month?: number;
            year?: number;
            type?: TransactionType;
            note?: string;
        },
    ) {
        const filter: any = { userId: new Types.ObjectId(userId) };

        // Filter by month & year
        if (query.month && query.year) {
            const startDate = new Date(query.year, query.month - 1, 1);
            const endDate = new Date(query.year, query.month, 0, 23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        } else if (query.year) {
            const startDate = new Date(query.year, 0, 1);
            const endDate = new Date(query.year, 11, 31, 23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        }

        // Filter by type
        if (query.type) {
            filter.type = query.type;
        }

        // Search by note
        if (query.note) {
            filter.note = { $regex: query.note, $options: 'i' };
        }

        return this.transactionModel
            .find(filter)
            .populate('categoryId')
            .sort({ date: -1 });
    }

    async findOne(userId: string, transactionId: string) {
        const transaction = await this.transactionModel
            .findOne({
                _id: new Types.ObjectId(transactionId),
                userId: new Types.ObjectId(userId),
            })
            .populate('categoryId');

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }
        return transaction;
    }

    async update(
        userId: string,
        transactionId: string,
        updateDto: UpdateTransactionDto,
    ) {
        const updateData: any = { ...updateDto };
        if (updateDto.categoryId) {
            updateData.categoryId = new Types.ObjectId(updateDto.categoryId);
        }
        if (updateDto.date) {
            updateData.date = new Date(updateDto.date);
        }

        const transaction = await this.transactionModel
            .findOneAndUpdate(
                {
                    _id: new Types.ObjectId(transactionId),
                    userId: new Types.ObjectId(userId),
                },
                updateData,
                { new: true },
            )
            .populate('categoryId');

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }
        return transaction;
    }

    async remove(userId: string, transactionId: string) {
        const transaction = await this.transactionModel.findOneAndDelete({
            _id: new Types.ObjectId(transactionId),
            userId: new Types.ObjectId(userId),
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }
        return { message: 'Transaction deleted successfully' };
    }
}

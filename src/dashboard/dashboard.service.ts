import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
} from '../schemas/transaction.schema';

interface AggregateTypeResult {
  _id: TransactionType;
  total: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  private getDateRange(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  async getSummary(userId: string, month: number, year: number) {
    const { startDate, endDate } = this.getDateRange(month, year);

    const result = await this.transactionModel
      .aggregate<AggregateTypeResult>([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ])
      .exec();

    const totalIncome =
      result.find((r) => r._id === TransactionType.INCOME)?.total || 0;
    const totalExpense =
      result.find((r) => r._id === TransactionType.EXPENSE)?.total || 0;
    const balance = totalIncome - totalExpense;

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance,
    };
  }

  async getIncomeExpenseChart(userId: string, month: number, year: number) {
    const summary = await this.getSummary(userId, month, year);
    return {
      month,
      year,
      data: [
        { label: 'Income', value: summary.totalIncome },
        { label: 'Expense', value: summary.totalExpense },
      ],
    };
  }

  async getByCategoryChart(userId: string, month: number, year: number) {
    const { startDate, endDate } = this.getDateRange(month, year);

    const result = await this.transactionModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            categoryName: '$category.name',
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id.categoryId',
          categoryName: '$_id.categoryName',
          type: '$_id.type',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    return {
      month,
      year,
      data: result,
    };
  }
}

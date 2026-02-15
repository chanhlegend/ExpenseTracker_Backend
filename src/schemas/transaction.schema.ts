import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
}

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    @Prop({ required: true, enum: TransactionType })
    type: TransactionType;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ trim: true, default: '' })
    note: string;

    @Prop({ required: true })
    date: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, categoryId: 1 });

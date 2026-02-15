import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument, CategoryType } from '../schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name)
        private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(userId: string, createCategoryDto: CreateCategoryDto) {
        const existing = await this.categoryModel.findOne({
            userId: new Types.ObjectId(userId),
            name: createCategoryDto.name,
        });
        if (existing) {
            throw new ConflictException('Category with this name already exists');
        }

        const category = await this.categoryModel.create({
            userId: new Types.ObjectId(userId),
            ...createCategoryDto,
        });
        return category;
    }

    async findAll(userId: string, type?: CategoryType) {
        const filter: any = { userId: new Types.ObjectId(userId) };
        if (type) {
            filter.type = type;
        }
        return this.categoryModel.find(filter).sort({ name: 1 });
    }

    async remove(userId: string, categoryId: string) {
        const category = await this.categoryModel.findOneAndDelete({
            _id: new Types.ObjectId(categoryId),
            userId: new Types.ObjectId(userId),
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return { message: 'Category deleted successfully' };
    }
}

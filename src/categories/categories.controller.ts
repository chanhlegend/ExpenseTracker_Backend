import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { CategoryType } from '../schemas/category.schema';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    async create(
        @GetUser() user: any,
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(user._id, createCategoryDto);
    }

    @Get()
    async findAll(
        @GetUser() user: any,
        @Query('type') type?: CategoryType,
    ) {
        return this.categoriesService.findAll(user._id, type);
    }

    @Delete(':id')
    async remove(@GetUser() user: any, @Param('id') id: string) {
        return this.categoriesService.remove(user._id, id);
    }
}

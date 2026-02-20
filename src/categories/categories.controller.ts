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
import type { JwtUser } from '../types/jwt-user.type';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @GetUser() user: JwtUser,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(
      user._id.toString(),
      createCategoryDto,
    );
  }

  @Get()
  async findAll(@GetUser() user: JwtUser, @Query('type') type?: CategoryType) {
    return this.categoriesService.findAll(user._id.toString(), type);
  }

  @Delete(':id')
  async remove(@GetUser() user: JwtUser, @Param('id') id: string) {
    return this.categoriesService.remove(user._id.toString(), id);
  }
}

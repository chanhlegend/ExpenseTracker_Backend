import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from '../../schemas/category.schema';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(CategoryType)
  @IsNotEmpty()
  type!: CategoryType;
}

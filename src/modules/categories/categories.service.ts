import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { categoryCode: dto.categoryCode } });
    if (existing) throw new ConflictException('Category code already exists');

    let level = 0;
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent category not found');
      level = parent.level + 1;
    }

    const category = await this.prisma.category.create({
      data: { ...dto, level },
    });
    return { message: 'Category created', data: category };
  }

  async findAll(type?: CategoryType, activeOnly: boolean = true) {
    const where: any = {};
    if (type) where.categoryType = type;
    if (activeOnly) where.isActive = true;

    const categories = await this.prisma.category.findMany({
      where,
      include: { children: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });
    return { data: categories };
  }

  async findByType(type: CategoryType) {
    const categories = await this.prisma.category.findMany({
      where: { categoryType: type, isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: { children: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
    return { data: categories };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return { data: category };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({ where: { id }, data: dto });
    return { message: 'Category updated', data: updated };
  }

  async toggleActive(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
    return { message: `Category ${updated.isActive ? 'activated' : 'deactivated'}`, data: updated };
  }
}
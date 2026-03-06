// import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// import { PrismaService } from '../../prisma/prisma.service';
// import { CreateCategoryDto } from './dto/create-category.dto';
// import { UpdateCategoryDto } from './dto/update-category.dto';
// import { CategoryType } from '@prisma/client';

// @Injectable()
// export class CategoriesService {
//   constructor(private prisma: PrismaService) {}

//   async create(dto: CreateCategoryDto) {
//     const existing = await this.prisma.category.findUnique({ where: { categoryCode: dto.categoryCode } });
//     if (existing) throw new ConflictException('Category code already exists');

//     let level = 0;
//     if (dto.parentId) {
//       const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
//       if (!parent) throw new NotFoundException('Parent category not found');
//       level = parent.level + 1;
//     }

//     const category = await this.prisma.category.create({
//       data: { ...dto, level },
//     });
//     return { message: 'Category created', data: category };
//   }

//   async findAll(type?: CategoryType, activeOnly: boolean = true) {
//     const where: any = {};
//     if (type) where.categoryType = type;
//     if (activeOnly) where.isActive = true;

//     const categories = await this.prisma.category.findMany({
//       where,
//       include: { children: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
//       orderBy: { displayOrder: 'asc' },
//     });
//     return { data: categories };
//   }

//   async findByType(type: CategoryType) {
//     const categories = await this.prisma.category.findMany({
//       where: { categoryType: type, isActive: true, parentId: null },
//       include: {
//         children: {
//           where: { isActive: true },
//           orderBy: { displayOrder: 'asc' },
//           include: { children: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
//         },
//       },
//       orderBy: { displayOrder: 'asc' },
//     });
//     return { data: categories };
//   }

//   async findOne(id: string) {
//     const category = await this.prisma.category.findUnique({
//       where: { id },
//       include: { children: true, parent: true },
//     });
//     if (!category) throw new NotFoundException('Category not found');
//     return { data: category };
//   }

//   async update(id: string, dto: UpdateCategoryDto) {
//     const category = await this.prisma.category.findUnique({ where: { id } });
//     if (!category) throw new NotFoundException('Category not found');

//     const updated = await this.prisma.category.update({ where: { id }, data: dto });
//     return { message: 'Category updated', data: updated };
//   }

//   async toggleActive(id: string) {
//     const category = await this.prisma.category.findUnique({ where: { id } });
//     if (!category) throw new NotFoundException('Category not found');

//     const updated = await this.prisma.category.update({
//       where: { id },
//       data: { isActive: !category.isActive },
//     });
//     return { message: `Category ${updated.isActive ? 'activated' : 'deactivated'}`, data: updated };
//   }
// }

// src/modules/categories/categories.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryType } from '@prisma/client';

// ─── Composite shorthand → actual DB enum values ───
// Direct enum values like PRODUCT_AGRICULTURAL still work as-is
const COMPOSITE_TYPE_MAP: Record<string, CategoryType[]> = {
  TOOL: [
    'TOOL_FARMING' as CategoryType,
    'TOOL_ARTISAN' as CategoryType,
  ],
  PRODUCT: [
    'PRODUCT_AGRICULTURAL' as CategoryType,
    'PRODUCT_ARTISAN' as CategoryType,
  ],
  SERVICE: [
    'SERVICE_FARMING' as CategoryType,
    'SERVICE_ARTISAN' as CategoryType,
  ],
  SPECIALIZATION: [
    'FARMER_SPECIALIZATION' as CategoryType,
    'ARTISAN_SPECIALIZATION' as CategoryType,
  ],
};

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolves type string to CategoryType[].
   * Accepts both composite ("TOOL") and direct ("TOOL_FARMING") values.
   */
  private resolveTypes(type: string): CategoryType[] {
    const upper = type.toUpperCase();

    // 1. Check composite map
    if (COMPOSITE_TYPE_MAP[upper]) {
      return COMPOSITE_TYPE_MAP[upper];
    }

    // 2. Check direct enum value
    const validValues = Object.values(CategoryType);
    if (validValues.includes(upper as CategoryType)) {
      return [upper as CategoryType];
    }

    // 3. Invalid
    throw new BadRequestException(
      `Invalid category type: "${type}". Valid: ${[
        ...Object.keys(COMPOSITE_TYPE_MAP),
        ...validValues,
      ].join(', ')}`,
    );
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { categoryCode: dto.categoryCode },
    });
    if (existing) throw new ConflictException('Category code already exists');

    let level = 0;
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      level = parent.level + 1;
    }

    const category = await this.prisma.category.create({
      data: { ...dto, level },
    });
    return { message: 'Category created', data: category };
  }

  // ─── Changed: type param is now string, supports composite ───
  async findAll(type?: string, activeOnly: boolean = true) {
    const where: any = {};
    if (activeOnly) where.isActive = true;

    if (type) {
      const resolved = this.resolveTypes(type);
      where.categoryType =
        resolved.length === 1 ? resolved[0] : { in: resolved };
    }

    const categories = await this.prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [{ categoryType: 'asc' }, { displayOrder: 'asc' }],
    });

    return { data: categories };
  }

  // ─── Changed: type param is now string, supports composite ───
  // ─── Added: grouped field for multi-type responses ───
  async findByType(type: string) {
    const resolved = this.resolveTypes(type);

    const categories = await this.prisma.category.findMany({
      where: {
        categoryType: resolved.length === 1 ? resolved[0] : { in: resolved },
        isActive: true,
        parentId: null,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
      orderBy: [{ categoryType: 'asc' }, { displayOrder: 'asc' }],
    });

    // Build grouped map (useful when multiple types returned)
    const grouped: Record<string, typeof categories> = {};
    for (const cat of categories) {
      const key = cat.categoryType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(cat);
    }

    return {
      data: categories,
      grouped,
      total: categories.length,
    };
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
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    });
    return { message: 'Category updated', data: updated };
  }

  async toggleActive(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });
    return {
      message: `Category ${updated.isActive ? 'activated' : 'deactivated'}`,
      data: updated,
    };
  }
}
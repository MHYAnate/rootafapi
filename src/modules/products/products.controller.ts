import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';
import { JwtAuthGuard, VerifiedUserGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products (public)' })
  findAll(@Query() query: ProductQueryDto) {
    return this.service.findAllPublic(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Get('me/list')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Get my products' })
  getMyProducts(@CurrentUser('id') userId: string, @Query() query: ProductQueryDto) {
    return this.service.getMyProducts(userId, query);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Post()
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Create product' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProductDto) {
    return this.service.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Put(':id')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Update product' })
  update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.service.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Delete(':id')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Delete product (soft)' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(userId, id);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Post(':id/images')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Add product image' })
  addImage(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { imageUrl: string; thumbnailUrl: string; mediumUrl: string; isPrimary?: boolean },
  ) {
    return this.service.addImage(userId, id, body.imageUrl, body.thumbnailUrl, body.mediumUrl, body.isPrimary);
  }

  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @Delete(':productId/images/:imageId')
  @ApiBearerAuth('user-jwt')
  @ApiOperation({ summary: 'Remove product image' })
  removeImage(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.service.removeImage(userId, productId, imageId);
  }
}
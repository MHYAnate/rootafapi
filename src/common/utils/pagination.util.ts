import { PaginationMeta } from '../interfaces';

export class PaginationUtil {
  static getSkipTake(page: number = 1, limit: number = 12) {
    return { skip: (page - 1) * limit, take: limit };
  }

  static createMeta(total: number, page: number, limit: number): PaginationMeta {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
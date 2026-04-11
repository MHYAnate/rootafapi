// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class TransformInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     return next.handle().pipe(
//       map((responseData) => {
//         const response = context.switchToHttp().getResponse();
//         if (responseData?.raw) return responseData.data;
//         return {
//           success: true,
//           statusCode: response.statusCode,
//           message: responseData?.message || 'Success',
//           data: responseData?.data !== undefined ? responseData.data : responseData,
//           timestamp: new Date().toISOString(),
//         };
//       }),
//     );
//   }
// }
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse> {
    return next.handle().pipe(
      map((responseData) => {
        const response = context.switchToHttp().getResponse();
        
        // Handle raw responses (e.g., file downloads)
        if (responseData?.raw) {
          return responseData.data;
        }

        const statusCode = response.statusCode;
        const timestamp = new Date().toISOString();

        // Handle paginated responses: { data: [...], meta: {...} }
        if (
          responseData &&
          typeof responseData === 'object' &&
          'data' in responseData &&
          'meta' in responseData
        ) {
          return {
            success: true,
            statusCode,
            message: responseData.message || 'Success',
            data: responseData.data,
            meta: responseData.meta,
            timestamp,
          };
        }

        // Handle responses with data property but no meta: { data: {...}, message?: string }
        if (
          responseData &&
          typeof responseData === 'object' &&
          'data' in responseData &&
          !('meta' in responseData)
        ) {
          return {
            success: true,
            statusCode,
            message: responseData.message || 'Success',
            data: responseData.data,
            timestamp,
          };
        }

        // Handle plain responses (no wrapper)
        return {
          success: true,
          statusCode,
          message: 'Success',
          data: responseData,
          timestamp,
        };
      }),
    );
  }
}
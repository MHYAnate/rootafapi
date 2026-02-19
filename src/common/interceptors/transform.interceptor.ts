import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((responseData) => {
        const response = context.switchToHttp().getResponse();
        if (responseData?.raw) return responseData.data;
        return {
          success: true,
          statusCode: response.statusCode,
          message: responseData?.message || 'Success',
          data: responseData?.data !== undefined ? responseData.data : responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
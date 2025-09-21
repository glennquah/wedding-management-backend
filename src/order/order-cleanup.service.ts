import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderService } from './order.service';

@Injectable()
export class OrderCleanupService {
  private readonly logger = new Logger(OrderCleanupService.name);

  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleOrderCleanup() {
    this.logger.debug('Running order cleanup task...');

    try {
      const result = await this.orderService.cleanupExpiredOrders();
      
      if (result.cleanedCount > 0) {
        this.logger.log(`Cleaned up ${result.cleanedCount} expired orders`);
      } else {
        this.logger.debug('No expired orders found');
      }
    } catch (error) {
      this.logger.error('Error during order cleanup:', error);
    }
  }

  // Manual cleanup method for testing/admin use
  async manualCleanup(): Promise<{ cleanedCount: number }> {
    this.logger.log('Manual order cleanup triggered');

    try {
      const result = await this.orderService.cleanupExpiredOrders();
      this.logger.log(`Manual cleanup completed. Cleaned ${result.cleanedCount} orders`);
      return result;
    } catch (error) {
      this.logger.error('Error during manual cleanup:', error);
      throw error;
    }
  }
}
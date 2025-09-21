import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Status of the order',
    enum: OrderStatus,
    enumName: 'OrderStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @ApiProperty({
    description: 'Additional remarks about the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}
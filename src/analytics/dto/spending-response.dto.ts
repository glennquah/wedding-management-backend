import { ApiProperty } from '@nestjs/swagger';

export class SpendingResponseDto {
  @ApiProperty({
    description: 'Total amount spent on orders',
    example: 25000,
  })
  totalSpending: number;

  @ApiProperty({
    description: 'Allocated budget for the wedding',
    example: 50000,
  })
  allocatedBudget: number;

  @ApiProperty({
    description: 'Current spending from the wedding record',
    example: 25000,
  })
  currentSpending: number;

  @ApiProperty({
    description: 'Remaining budget',
    example: 25000,
  })
  remainingBudget: number;

  @ApiProperty({
    description: 'Percentage of budget used',
    example: 50,
  })
  budgetUsedPercentage: number;

  @ApiProperty({
    description: 'Number of orders placed',
    example: 5,
  })
  orderCount: number;

  @ApiProperty({
    description: 'Currency used',
    example: 'SGD',
  })
  currency: string;
}

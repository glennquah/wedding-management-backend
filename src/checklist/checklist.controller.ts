import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ChecklistResponseDto } from './dto/checklist-response.dto';
import { ChecklistItemResponseDto } from './dto/checklist-item-response.dto';
import { ChatMessageResponseDto } from './dto/chat-message-response.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/user-role.enum';

@ApiTags('Checklist')
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create a new checklist for a wedding' })
  @ApiResponse({
    status: 201,
    description: 'Checklist created successfully',
    type: ChecklistResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Wedding not found' })
  @ApiResponse({
    status: 409,
    description: 'Checklist already exists for this wedding',
  })
  async create(
    @Body() createChecklistDto: CreateChecklistDto,
  ): Promise<ChecklistResponseDto> {
    return this.checklistService.create(createChecklistDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all checklists (admin use)' })
  @ApiResponse({
    status: 200,
    description: 'All checklists retrieved successfully',
    type: [ChecklistResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<ChecklistResponseDto[]> {
    return this.checklistService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get checklist by ID' })
  @ApiParam({ name: 'id', description: 'Checklist ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist retrieved successfully',
    type: ChecklistResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ChecklistResponseDto> {
    return this.checklistService.findOne(id);
  }

  @Get('wedding/:weddingId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get checklist by wedding ID' })
  @ApiParam({ name: 'weddingId', description: 'Wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist retrieved successfully',
    type: ChecklistResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'Checklist not found for this wedding',
  })
  async findByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<ChecklistResponseDto> {
    return this.checklistService.findByWeddingId(weddingId);
  }

  @Get('wedding/:weddingId/chat-history')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get chat history for checklist by wedding ID' })
  @ApiParam({ name: 'weddingId', description: 'Wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Chat history retrieved successfully',
    type: [ChatMessageResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'Checklist not found for this wedding',
  })
  async getChatHistoryByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
  ): Promise<ChatMessageResponseDto[]> {
    return this.checklistService.getChatHistoryByWeddingId(weddingId);
  }

  @Put('wedding/:weddingId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({
    summary:
      'Update checklist by wedding ID - for updating items and stage progression',
    description:
      'Updates checklist items and current stage. Used for saving state on Next Category clicks.',
  })
  @ApiParam({ name: 'weddingId', description: 'Wedding ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist updated successfully',
    type: ChecklistResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({
    status: 404,
    description: 'Checklist not found for this wedding',
  })
  async updateByWeddingId(
    @Param('weddingId', ParseIntPipe) weddingId: number,
    @Body() updateChecklistDto: UpdateChecklistDto,
  ): Promise<ChecklistResponseDto> {
    return this.checklistService.updateByWeddingId(
      weddingId,
      updateChecklistDto,
    );
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update checklist' })
  @ApiParam({ name: 'id', description: 'Checklist ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist updated successfully',
    type: ChecklistResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChecklistDto: UpdateChecklistDto,
  ): Promise<ChecklistResponseDto> {
    return this.checklistService.update(id, updateChecklistDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete checklist' })
  @ApiParam({ name: 'id', description: 'Checklist ID' })
  @ApiResponse({ status: 204, description: 'Checklist deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.checklistService.remove(id);
  }

  @Post(':id/items')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Add a new item to checklist' })
  @ApiParam({ name: 'id', description: 'Checklist ID' })
  @ApiResponse({
    status: 201,
    description: 'Checklist item created successfully',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() createChecklistItemDto: CreateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    return this.checklistService.addItem(id, createChecklistItemDto);
  }

  @Put('items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Update a checklist item' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist item updated successfully',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  async updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateChecklistItemDto: UpdateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    return this.checklistService.updateItem(itemId, updateChecklistItemDto);
  }

  @Delete('items/:itemId')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a checklist item' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID' })
  @ApiResponse({
    status: 204,
    description: 'Checklist item deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  async removeItem(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<void> {
    return this.checklistService.removeItem(itemId);
  }

  @Patch('items/:itemId/complete')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Mark a checklist item as completed' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist item marked as completed',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  async markItemCompleted(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<ChecklistItemResponseDto> {
    return this.checklistService.markItemCompleted(itemId);
  }

  @Patch('items/:itemId/uncomplete')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Mark a checklist item as uncompleted' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist item marked as uncompleted',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  async markItemUncompleted(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<ChecklistItemResponseDto> {
    return this.checklistService.markItemUncompleted(itemId);
  }

  @Patch('items/:itemId/toggle')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Toggle completion status of a checklist item' })
  @ApiParam({ name: 'itemId', description: 'Checklist item ID' })
  @ApiResponse({
    status: 200,
    description: 'Checklist item completion status toggled',
    type: ChecklistItemResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist item not found' })
  async toggleItemCompletion(
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<ChecklistItemResponseDto> {
    return this.checklistService.toggleItemCompletion(itemId);
  }

  @Get(':id/items/category')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get checklist items by category' })
  @ApiParam({ name: 'id', description: 'Checklist ID' })
  @ApiQuery({ name: 'category', description: 'Category name' })
  @ApiResponse({
    status: 200,
    description: 'Checklist items retrieved by category',
    type: [ChecklistItemResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async getItemsByCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('category') category: string,
  ): Promise<ChecklistItemResponseDto[]> {
    return this.checklistService.getItemsByCategory(id, category);
  }

  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get completion statistics for a checklist' })
  @ApiParam({ name: 'id', description: 'Checklist ID' })
  @ApiResponse({
    status: 200,
    description: 'Completion statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total number of items' },
        completed: { type: 'number', description: 'Number of completed items' },
        percentage: { type: 'number', description: 'Completion percentage' },
        byCategory: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              completed: { type: 'number' },
              percentage: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Checklist not found' })
  async getCompletionStats(@Param('id', ParseIntPipe) id: number): Promise<{
    total: number;
    completed: number;
    percentage: number;
    byCategory: Record<
      string,
      { total: number; completed: number; percentage: number }
    >;
  }> {
    return this.checklistService.getCompletionStats(id);
  }
}

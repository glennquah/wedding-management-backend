import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  Checklist,
  ChecklistItem,
  ChatMessage,
  ChatbotStage,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { ChecklistResponseDto } from './dto/checklist-response.dto';
import { ChecklistItemResponseDto } from './dto/checklist-item-response.dto';
import { ChatMessageResponseDto } from './dto/chat-message-response.dto';
import { ChecklistStatsResponseDto } from './dto/checklist-stats-response.dto';

type ChecklistWithItems = Checklist & {
  items: ChecklistItem[];
  chatHistory: ChatMessage[];
  currentStage: ChatbotStage;
};

@Injectable()
export class ChecklistService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new checklist for a wedding
   */
  async create(dto: CreateChecklistDto): Promise<ChecklistResponseDto> {
    // Check if wedding exists
    const wedding = await this.prisma.wedding.findUnique({
      where: { id: dto.weddingId },
    });

    if (!wedding) {
      throw new NotFoundException(`Wedding with ID ${dto.weddingId} not found`);
    }

    // Check if checklist already exists for this wedding
    const existingChecklist = await this.prisma.checklist.findUnique({
      where: { weddingId: dto.weddingId },
    });

    if (existingChecklist) {
      throw new ConflictException(
        `Checklist already exists for wedding ID ${dto.weddingId}`,
      );
    }

    const checklist = await this.prisma.checklist.create({
      data: {
        weddingId: dto.weddingId,
        items: {
          create: dto.items.map((item) => ({
            title: item.title,
            description: item.description,
            category: item.category,
            monthsBeforeWedding: item.monthsBeforeWedding,
            completed: item.completed ?? false,
          })),
        },
        ...(dto.chatHistory &&
          dto.chatHistory.length > 0 && {
            chatHistory: {
              create: dto.chatHistory.map((message) => ({
                role: message.role,
                content: message.content,
                ...(message.createdAt && {
                  createdAt: new Date(message.createdAt),
                }),
              })),
            },
          }),
      },
      include: {
        items: true,
        chatHistory: true,
      },
    });

    return this.mapToResponseDto(checklist);
  }

  /**
   * Get all checklists (admin use)
   */
  async findAll(): Promise<ChecklistResponseDto[]> {
    const checklists = await this.prisma.checklist.findMany({
      include: {
        items: true,
        chatHistory: true,
      },
    });

    return checklists.map((checklist) => this.mapToResponseDto(checklist));
  }

  /**
   * Get checklist by ID
   */
  async findOne(id: number): Promise<ChecklistResponseDto> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        items: true,
        chatHistory: true,
      },
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }

    return this.mapToResponseDto(checklist);
  }

  /**
   * Get checklist by wedding ID
   */
  async findByWeddingId(weddingId: number): Promise<ChecklistResponseDto> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { weddingId },
      include: {
        items: true,
        chatHistory: true,
      },
    });

    if (!checklist) {
      throw new NotFoundException(
        `Checklist for wedding ID ${weddingId} not found`,
      );
    }

    return this.mapToResponseDto(checklist);
  }

  /**
   * Get chat history by wedding ID
   */
  async getChatHistoryByWeddingId(
    weddingId: number,
  ): Promise<ChatMessageResponseDto[]> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { weddingId },
      include: {
        chatHistory: true,
      },
    });

    if (!checklist) {
      throw new NotFoundException(
        `Checklist for wedding ID ${weddingId} not found`,
      );
    }

    return checklist.chatHistory.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      checklistId: message.checklistId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  }

  /**
   * Update checklist
   */
  async update(
    id: number,
    dto: UpdateChecklistDto,
  ): Promise<ChecklistResponseDto> {
    const existingChecklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingChecklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }

    const checklist = await this.prisma.checklist.update({
      where: { id },
      data: {
        ...(dto.weddingId && { weddingId: dto.weddingId }),
        ...(dto.currentStage && {
          currentStage: dto.currentStage as ChatbotStage,
        }),
        ...(dto.items && {
          items: {
            deleteMany: {},
            create: dto.items.map((item) => ({
              title: item.title,
              description: item.description,
              category: item.category,
              monthsBeforeWedding: item.monthsBeforeWedding,
              completed: item.completed ?? false,
            })),
          },
        }),
        ...(dto.chatHistory &&
          dto.chatHistory.length > 0 && {
            chatHistory: dto.appendChatHistory
              ? {
                  create: dto.chatHistory.map((message) => ({
                    role: message.role,
                    content: message.content,
                    ...(message.createdAt && {
                      createdAt: new Date(message.createdAt),
                    }),
                  })),
                }
              : {
                  deleteMany: {},
                  create: dto.chatHistory.map((message) => ({
                    role: message.role,
                    content: message.content,
                    ...(message.createdAt && {
                      createdAt: new Date(message.createdAt),
                    }),
                  })),
                },
          }),
      },
      include: {
        items: true,
        chatHistory: true,
      },
    });

    return this.mapToResponseDto(checklist);
  }

  /**
   * Update checklist by wedding ID - specifically for updating items and stage progression
   */
  async updateByWeddingId(
    weddingId: number,
    dto: UpdateChecklistDto,
  ): Promise<ChecklistResponseDto> {
    const existingChecklist = await this.prisma.checklist.findUnique({
      where: { weddingId },
      include: { items: true },
    });

    if (!existingChecklist) {
      throw new NotFoundException(
        `Checklist for wedding ID ${weddingId} not found`,
      );
    }

    const checklist = await this.prisma.checklist.update({
      where: { weddingId },
      data: {
        ...(dto.currentStage && {
          currentStage: dto.currentStage as ChatbotStage,
        }),
        ...(dto.items && {
          items: {
            deleteMany: {},
            create: dto.items.map((item) => ({
              title: item.title,
              description: item.description,
              category: item.category,
              monthsBeforeWedding: item.monthsBeforeWedding,
              completed: item.completed ?? false,
            })),
          },
        }),
        ...(dto.chatHistory &&
          dto.chatHistory.length > 0 && {
            chatHistory: dto.appendChatHistory
              ? {
                  create: dto.chatHistory.map((message) => ({
                    role: message.role,
                    content: message.content,
                  })),
                }
              : {
                  deleteMany: {},
                  create: dto.chatHistory.map((message) => ({
                    role: message.role,
                    content: message.content,
                  })),
                },
          }),
      },
      include: {
        items: true,
        chatHistory: true,
      },
    });

    return this.mapToResponseDto(checklist);
  }

  /**
   * Delete checklist
   */
  async remove(id: number): Promise<void> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }

    await this.prisma.checklist.delete({
      where: { id },
    });
  }

  /**
   * Add a new item to existing checklist
   */
  async addItem(
    checklistId: number,
    dto: CreateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${checklistId} not found`);
    }

    const item = await this.prisma.checklistItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        monthsBeforeWedding: dto.monthsBeforeWedding,
        completed: dto.completed ?? false,
        checklistId,
      },
    });

    return this.mapToItemResponseDto(item);
  }

  /**
   * Update a checklist item
   */
  async updateItem(
    itemId: number,
    dto: UpdateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const existingItem = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    const item = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.monthsBeforeWedding !== undefined && {
          monthsBeforeWedding: dto.monthsBeforeWedding,
        }),
        ...(dto.completed !== undefined && { completed: dto.completed }),
      },
    });

    return this.mapToItemResponseDto(item);
  }

  /**
   * Delete a checklist item
   */
  async removeItem(itemId: number): Promise<void> {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    await this.prisma.checklistItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Mark a checklist item as completed
   */
  async markItemCompleted(itemId: number): Promise<ChecklistItemResponseDto> {
    const existingItem = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    const item = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { completed: true },
    });

    return this.mapToItemResponseDto(item);
  }

  /**
   * Mark a checklist item as uncompleted
   */
  async markItemUncompleted(itemId: number): Promise<ChecklistItemResponseDto> {
    const existingItem = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    const item = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { completed: false },
    });

    return this.mapToItemResponseDto(item);
  }

  /**
   * Toggle completion status of a checklist item
   */
  async toggleItemCompletion(
    itemId: number,
  ): Promise<ChecklistItemResponseDto> {
    const existingItem = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException(`Checklist item with ID ${itemId} not found`);
    }

    const item = await this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { completed: !existingItem.completed },
    });

    return this.mapToItemResponseDto(item);
  }

  /**
   * Get checklist items by category
   */
  async getItemsByCategory(
    checklistId: number,
    category: string,
  ): Promise<ChecklistItemResponseDto[]> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${checklistId} not found`);
    }

    const items = await this.prisma.checklistItem.findMany({
      where: {
        checklistId,
        category,
      },
      orderBy: { monthsBeforeWedding: 'desc' },
    });

    return items.map((item) => this.mapToItemResponseDto(item));
  }

  /**
   * Get completion statistics for a checklist
   */
  async getCompletionStats(
    checklistId: number,
  ): Promise<ChecklistStatsResponseDto> {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
      include: { items: true },
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${checklistId} not found`);
    }

    const total = checklist.items.length;
    const completed = checklist.items.filter((item) => item.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    // Group by category
    const byCategory: Record<
      string,
      { total: number; completed: number; percentage: number }
    > = {};

    checklist.items.forEach((item) => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = { total: 0, completed: 0, percentage: 0 };
      }
      byCategory[item.category].total++;
      if (item.completed) {
        byCategory[item.category].completed++;
      }
    });

    // Calculate percentages for each category
    Object.keys(byCategory).forEach((category) => {
      const categoryData = byCategory[category];
      categoryData.percentage =
        categoryData.total > 0
          ? (categoryData.completed / categoryData.total) * 100
          : 0;
    });

    return {
      total,
      completed,
      percentage: Math.round(percentage * 100) / 100,
      byCategory,
    };
  }

  /**
   * Map database model to response DTO
   */
  private mapToResponseDto(
    checklist: ChecklistWithItems,
  ): ChecklistResponseDto {
    return {
      id: checklist.id,
      weddingId: checklist.weddingId,
      items: checklist.items.map((item) => this.mapToItemResponseDto(item)),
      chatHistory:
        checklist.chatHistory?.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          checklistId: message.checklistId,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        })) || [],
      currentStage: checklist.currentStage,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
    };
  }

  /**
   * Map database model to item response DTO
   */
  private mapToItemResponseDto(item: ChecklistItem): ChecklistItemResponseDto {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      monthsBeforeWedding: item.monthsBeforeWedding,
      completed: item.completed,
      checklistId: item.checklistId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}

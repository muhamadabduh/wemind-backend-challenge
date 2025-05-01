import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    learningSession: {
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const dto = { email: 'unit@test.com', name: 'Unit' };
    const result = { id: 'uuid', ...dto };

    mockPrismaService.user.create.mockResolvedValue(result);

    expect(await service.create(dto)).toEqual(result);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data: dto });
  });

  describe('getUserSessionSummary', () => {
    const mockSessions = [
      { topic: 'NestJS', duration: 30 },
      { topic: 'Prisma', duration: 20 },
      { topic: 'NestJS', duration: 45 },
    ];

    beforeEach(() => {
      mockPrismaService.learningSession.findMany.mockResolvedValue(mockSessions);
    });

    it('should group by topic and sum durations', async () => {
      const result = await service.getSummary(
        'user-uuid',
        '2025-04-01',
        '2025-04-05',
      );

      expect(mockPrismaService.learningSession.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-uuid',
          date: {
            gte: new Date('2025-04-01'),
            lte: new Date('2025-04-05'),
          },
        },
      });

      expect(result).toEqual([
        { topic: 'NestJS', totalDuration: 75 },
        { topic: 'Prisma', totalDuration: 20 },
      ]);
    });
  });

});

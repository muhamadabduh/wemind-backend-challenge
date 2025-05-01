import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

      const mockUsersService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should call service.create and return the result', async () => {
    const dto: CreateUserDto = { email: 'ctrl@test.com', name: 'Ctrl' };
    const result = { id: 'uuid', ...dto };

    mockUsersService.create.mockResolvedValue(result);

    const response = await controller.create(dto);
    expect(response).toEqual(result);
    expect(service.create).toHaveBeenCalledWith(dto);
  });
});

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    // Clean up users after each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST) should create a user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(201);

    expect(response.body.email).toBe(userData.email);
    expect(response.body.name).toBe(userData.name);
    expect(response.body.id).toBeDefined();
  });

  describe('/users/:id/summary (GET)', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: { email: 'summary@test.com' },
      });

      userId = user.id;

      await prisma.learningSession.createMany({
        data: [
          {
            userId,
            topic: 'NestJS',
            duration: 30,
            date: new Date('2025-04-01'),
          },
          {
            userId,
            topic: 'Prisma',
            duration: 20,
            date: new Date('2025-04-02'),
          },
          {
            userId,
            topic: 'NestJS',
            duration: 45,
            date: new Date('2025-04-03'),
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.learningSession.deleteMany();
      await prisma.user.deleteMany();
    });

    it('should return session summary grouped by topic', async () => {
      const res = await request(app.getHttpServer())
        .get(`/users/${userId}/summary`)
        .query({ from: '2025-04-01', to: '2025-04-05' })
        .expect(200);

      expect(res.body).toEqual(
        expect.arrayContaining([
          { topic: 'NestJS', totalDuration: 75 },
          { topic: 'Prisma', totalDuration: 20 },
        ]),
      );
    });
  });

});

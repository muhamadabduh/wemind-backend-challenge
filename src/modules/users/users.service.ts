import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { 
	startOfDay, 
	subDays, 
	format,  
  isSameDay,
  startOfWeek,
  isWithinInterval, 
} from 'date-fns';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async createSession(userId: string, dto: CreateSessionDto) {
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.learningSession.create({
      data: {
        ...dto,
        userId,
        date: new Date(dto.date), 
      },
    });
  }

  async getUserSessions(userId: string) {
    const user = await this.prisma.user.findUnique({
    	where: { id: userId },
    });

    if (!user) {
    	throw new NotFoundException('User not found');
    }

    const sessions = await this.prisma.learningSession.findMany({
    	where: { userId },
    	orderBy: { date: 'asc' },
    });

    return sessions
  }

  async getSummary(userId: string, from: string, to: string) {

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Validate dates
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid from/to date format');
    }
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sessions = await this.prisma.learningSession.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
    });

    // Group and summarize durations by topic
    const summaryMap = new Map<string, number>();

    for (const session of sessions) {
      const current = summaryMap.get(session.topic) || 0;
      summaryMap.set(session.topic, current + session.duration);
    }

    // Convert map to array
    return Array.from(summaryMap.entries()).map(([topic, totalDuration]) => ({
      topic,
      totalDuration,
    }));
  }

	async getUserStreak(userId: string) {
		// Get sessions sorted by date descending
		const sessions = await this.prisma.learningSession.findMany({
			where: { userId },
			orderBy: { date: 'desc' },
		});

		if (sessions.length === 0) {
			return {
				currentStreak: 0,
				lastActiveDate: null,
			};
		}

		// Build a Set of YYYY-MM-DD dates
		const activeDays = new Set(
			sessions.map((s) => format(startOfDay(s.date), 'yyyy-MM-dd'))
		);

		let streak = 0;
		let today = startOfDay(new Date());

		while (true) {
			const dayStr = format(today, 'yyyy-MM-dd');
			if (activeDays.has(dayStr)) {
				streak++;
				today = subDays(today, 1);
			} else {
				break;
			}
		}

		const lastActiveDate = sessions[0].date;

		return {
			currentStreak: streak,
			lastActiveDate: lastActiveDate.toISOString().split('T')[0]
		};
	}


	async getUserInsights(userId: string) {
		const sessions = await this.prisma.learningSession.findMany({
			where: { userId },
			orderBy: { date: 'asc' },
		});

		if (sessions.length === 0) {
			return {
				currentStreak: 0,
				longestStreak: 0,
				lastActiveDate: null,
				mostStudiedTopic: null,
				totalMinutesThisWeek: 0,
				averageDailyMinutes: 0,
				recommendation: 'No data yet. Start learning today!',
			};
		}

		// Group sessions by day
		const dateMap = new Map<string, number>();
		const topicMap = new Map<string, number>();

		sessions.forEach((s) => {
			const dayKey = format(startOfDay(s.date), 'yyyy-MM-dd');
			dateMap.set(dayKey, (dateMap.get(dayKey) || 0) + s.duration);
			topicMap.set(s.topic, (topicMap.get(s.topic) || 0) + s.duration);
		});

		// Calculate current streak (from latest day backward)
		const days = Array.from(dateMap.keys()).sort().map((d) => new Date(d));
		const lastActiveDate = days[days.length - 1];
		let currentStreak = 0;

		for (let i = days.length - 1; i >= 0; i--) {
			const expectedDate = subDays(lastActiveDate, days.length - 1 - i);
			if (isSameDay(expectedDate, days[i])) {
				currentStreak++;
			} else {
				break;
			}
		}

		// 📈 Longest streak
		let longestStreak = 1;
		let tempStreak = 1;
		for (let i = 1; i < days.length; i++) {
			const prev = days[i - 1];
			const curr = days[i];
			const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
			if (diff === 1) tempStreak++;
			else tempStreak = 1;
			longestStreak = Math.max(longestStreak, tempStreak);
		}

		// Most studied topic
		const mostStudiedTopic = Array.from(topicMap.entries())
			.sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

		// Time spent this week
		const now = new Date();
		const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
		const totalMinutesThisWeek = sessions
			.filter((s) =>
				isWithinInterval(s.date, {
					start: startOfDay(weekStart),
					end: startOfDay(now),
				}),
			)
			.reduce((sum, s) => sum + s.duration, 0);

		const averageDailyMinutes = +(totalMinutesThisWeek / days.length).toFixed(1);

		// Recommendation
		const recommendation =
			currentStreak > 0
				? `You're doing great! Try not to miss tomorrow to keep your streak going.`
				: `No active streak. Start today to build a habit!`;

		return {
			currentStreak,
			longestStreak,
			lastActiveDate: format(lastActiveDate, 'yyyy-MM-dd'),
			mostStudiedTopic,
			totalMinutesThisWeek,
			averageDailyMinutes,
			recommendation,
		};
	}

}

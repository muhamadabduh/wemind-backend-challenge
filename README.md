# Wemind Backend Challenge
Boilerplate from [nest-js-prisma-docker ](https://github.com/notiz-dev/nestjs-prisma-docker)


### How to start development server
```bash
npm install

cp .env.example .env

npx prisma generate

npm run start:dev
```

## Docker File

Get started by running

```bash
docker build -t nest-api .

docker run -p 3000:3000 --env-file .env -d nest-api
```

## Docker Compose

```bash
docker-compose up
# or detached
docker-compose up -d
```

## Test
### unit test
```bash
npm run test:cov
```
### e2e test
```bash
npm run test:e2e
```
### 🧠 Answers Bonus Product Questions 
1. If this platform scales to 100k users:
   - How would you handle streak calculation without slowing the system?
   - Would you compute it live or cache it? Why?

  [ANSWER] I would like to handle streak calculation by scheduling a cron-job to recalculates the streak nightly/daily and store the data into database To prevent memory usage because of the logic calculation. For example in Duolingo App, I notice that the cutoff of the daily streak is at the midnight and I assume that they calculate the daily streak on schedule. 
 By the morning, in the duolingo widget we can see the number of daily streaks.
 so the strategy is to store and update the streak in the database whenever a user has a learning sessions done.

2. If a product manager says, “We want the streak calculation to be real-time, but only during daytime hours,” how would you design that?

[ANSWER] In this case, Maybe I want to implement feature-toggle tools like Unleash. with the feature toggle we can switch feature whenever we need. for example if we monitor that the number active users are high so product manager can switch the feature to live streak calculation to be realtime. And when the number of active users are going diwn, it can be toggled-off

3. Suppose you notice duplicate learning sessions in the DB — how would you prevent or resolve this?

[ANSWER] I assumed that Wemind can be accessed in multiplatform e.g desktop and mobile So it's possible that user has two simultaneous sessions in each device. I suggest that we can restrict the users to have more than one simultaneous sessions while having learn-session from our app by checking the client's IP address/device id. 
 

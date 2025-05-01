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



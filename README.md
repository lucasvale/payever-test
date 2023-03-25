This project has a docker-compose file, that do everything needed to run this project!  

The api is running on: localhost:3000

The RabbitMQ web client is running on: localhost:15672

You can find a postman collection at .docs folder! 

## Running the app

```bash
# development
$ docker-compose up -d
```

## Test

The tests can only be run after the app is running, so you need to run the 'Running the app' command and after run the tests

```bash
# unit tests
$ docker exec -it payever_api npm run test
```
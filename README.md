# WTFapp-website

## Development environment

### Installing dependencies

To install all the dependencies, execute command :

```$ npm install```

This command will create the node_modules directory at the project root.

If you also want to use the node changes watcher, execute :

```$ sudo npm install -g nodemon```

### Launching the server

Standard server launching is :

```$ DEBUG=wtf:* ./bin/www```

If you want Node.JS to watch for any changes and reload the server when a change is detected, execute instead :

```$ DEBUG=wtf:* nodemon```

## API

### User

#### Identification behavior

Create an anonymous user (anonymous[#id]) for each application. The user is identified by his anonymous[#id] login and can use the application with no restriction. Once he creates his account with his email and password, his anonymous account will be updated and all his contribution will be linked to his email address.

#### Requests

##### Post (User creation)

To create a user, POST a JSON following the following schema to /api/users :

```{"email": "test@example.net", password: "test"}```

Password field should be at least 5 and at most 30 characters.

Example :

```curl -X POST -H "Content-Type:application/json" --data '{"email": "test@test.fr", "password":"testtt"}' http://localhost:5000/api/users/```

##### Get (Get user information)

To get a user's information or any other information, GET on /api/users/[mongodb_user_id] with email and password given in a basic authentication.

10 authentication tries are allowed per half-hour.

Example :

```curl -X GET http://test%40test.fr:testtt@localhost:5000/api/users/54deeba72736858d49a647dc```

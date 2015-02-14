# WTFapp-website

## Development environment

### Installing dependencies

To install all the dependencies, execute command :

```$ npm install```

This command will create the node_modules directory at the project root.

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

##### Get (Get user information)

To get a user's information or any other information, GET on /api/users/[mongodb_user_id] with email and password given in a basic authentication.


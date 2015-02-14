# WTFapp-website

## Installing dependencies

npm install

## Launching the server

DEBUG=wtf:* ./bin/www

## API request

### User

#### Post (User creation)

To create a user, POST a JSON following the following schema to /api/users :
{"email": "test@example.net", password: "test"}

#### Get (Get user information)

To get a user's information or any other information, GET on /api/users/[mongodb_user_id] with email and password given in a basic authentication.

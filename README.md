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

## REST API

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

##### Token access

To get an access token, GET /api/users/login with email and password given in a basic authentification.
10 authentication tries are allowed per half-hour.

Example :

```curl -X GET http://test%40test.fr:testtt@localhost:5000/api/users/login```

It returns a token to used on each requests.

##### Get (Get user information)

To get a user's information or any other information, GET on /api/users/[mongodb_user_id].

Example :

```curl -X GET http://localhost:5000/api/users/54deeba72736858d49a647dc -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NGRmNDkyNTY1ZDdhZWM2YjBmM2QxMDAiLCJlbWFpbCI6InRlc3RAdGVzdC5mciIsInBhc3N3b3JkIjoiJDJhJDEwJEJmSFpsaHVpTVhIVnZlVUNwVTBJQXUxRGpJNU5jOEQyOENCaGszQUJSMVZhRUIvNVBhVHYyIiwiX192IjowLCJsb2dpbkF0dGVtcHRzIjowfQ.B7qiir3Cx5zu3tF7V4TaFAqWQqZ6hfTVPcJIJOOnoTI"```

### Restaurant

#### GET /restaurants/refresh

Load initial restaurant informations

#### GET /restaurants

Retrieve a list of all restaurants

#### GET /restaurants?lat={latitude}&lng={longitude}

Retrieve a list of GeoResult. A GeoResult is composed of a dis property being the distance of the restaurant from the requested coordinates and an obj property being a restaurant.

An optional maxDistance parameter can be given to the API to reduce the radius of the request. By default, maxDistance equals 0.5 (500 m).

#### GET /restaurants/{id}

Retrieve the restaurant with the given id

#### PUT /users/{id}

Send your opinion about a meal.

curl -H "Content-Type:ap -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5mciIsInBhc3N3b3JkIjoiJDJhJDEwJDRyNU1CMi83MWRkZGpvNEd0dFhiNGVpTGR6UXZKVmlYQ0NNc3dKT0xMSVF6bU9Oc3hpRXVhIiwiX2lkIjoiNTRkZWY4YTU3Njk4NTlhNDU0ZTM5OTc0IiwiX192IjowLCJwb2xsIjpbXSwibG9naW5BdHRlbXB0cyI6MH0.v8ojBQR20jbm-gln57ljafixBBXn6yU5pnDLMQx88XE"  -X PUT -d '{"poll": {"date": "2015-02-14", "ate_alone": false, "convivial_restaurant": true, "enough_time_to_eat": true, "seasoning": 2, "cooking": 2, "hot_meal": 2, "meal_quality": 3, "enjoyed_my_meal": 2, "threw_away_food_itook": false, "threw_away_food_was_served": true, "bread_thrown": 2, "dishes": [{"_id": "54df23b6842142426fdfa111", "thrown": 3}]}}' http://localhost:5000/api/users/54def8a5769859a454e39974

#### GET /users/{id}

Get the informations about user and the poll to which he participated.

curl -X GET http://localhost:5000/api/users/54def8a5769859a454e39974 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5mciIsInBhc3N3b3JkIjoiJDJhJDEwJDRyNU1CMi83MWRkZGpvNEd0dFhiNGVpTGR6UXZKVmlYQ0NNc3dKT0xMSVF6bU9Oc3hpRXVhIiwiX2lkIjoiNTRkZWY4YTU3Njk4NTlhNDU0ZTM5OTc0IiwiX192IjowLCJwb2xsIjpbXSwibG9naW5BdHRlbXB0cyI6MH0.v8ojBQR20jbm-gln57ljafixBBXn6yU5pnDLMQx88XE"
{"__v":3,"_id":"54def8a5769859a454e39974","email":"test@test.fr","password":"$2a$10$4r5MB2/71dddjo4GttXb4eiLdzQvJViXCCMswJOLLIQzmONsxiEua","poll":[{"date":"2015-02-14T00:00:00.000Z","ate_alone":false,"convivial_restaurant":true,"enough_time_to_eat":true,"seasoning":2,"cooking":2,"hot_meal":2,"meal_quality":3,"enjoyed_my_meal":2,"threw_away_food_was_served":true,"bread_thrown":2,"_id":"54df8588341325ac2a413e55","dishes":[{"_id":"54df23b6842142426fdfa111","thrown":3}]}],"loginAttempts":0}[

# HMSL IoT

Interet of Things repo for HMSL



## Requirements
Node Version: v13.2.0
Yarn

## Applications
There are 2 application:

### app.js
The main application

### event_catcher.js
An Application to capture events


```
yarn run compile:js
```

done:
- dotenv
- bookshelf.js
- logger
- event catcher (push & pull)
- node map
  - use socket to update status
- pinger
- separate prod and dev env config
- user login
- api login

TODO:
- mode io in node model to singleton
- roles
- permissions
- home page


### Helpful commands

- Run redis  in background (used in production environment)

```
docker run -d -p 6379:6379 redis
```

Start the code with ES6 compaitibility
```
node -r esm app/queues/oee_rework.js
```

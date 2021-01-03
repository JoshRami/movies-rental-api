# Movie Rental API

The homework for this week consists of the creation of a small movie rental API(it'll be continued on the next week)

1. Follow best REST API practices
2. Use the Design patterns you think can improve your code readability or will improve your code stability
3. Try to avoid anti-patterns
4. PostgreSQL will be the DB to use
5. You should provide a DB dump to test your API, along with a Postman collection to allow us to test your API on our local
6. When doing the Unit/Integration test, make sure to follow the best API Testing practices.
   10 Decide, whether or not, to use the same DB for your unit tests, or use a mocking library.
7. Extra points are optional, as always. Work on them if you finish earlier!

### Base requirements

- [x] API should allow CRUD operations on movies (add, remove, update, create movies)
- [x] API should allow CRUD operations on users (add, remove, update, create users)
- [x] Each movie should have a list of tags related to them
- [x] Each movie should have a title, description, a poster, stock, a link to its trailer, sale price, likes and availability
- [ ] API should have one admin by default
- [x] If a user is admin or not should be handled by its Role. A user must have one Role (admin or client)
- [x] A client can rent a movie, return it or buy it.
- [x] Users should be able to get a list of movies (sorted alphabetically)
- [x] Add unit/integration tests (coverage must be 65% min)

### Security requirements

- [ ] Any person (logged in or not) can view a list of available movies
- [ ] Any person can see a movie's details
- [ ] Only admins can add/modify/remove movies
- [ ] Only logged in users can buy/rent a movie
- [ ] Logging/logout should be done using JWT
- [ ] Only admins should be able to add/remove tags

### Extra points

- [ ] Send an email when a user rent/buy a movie with important information!
- [ ] Allow an admin to change a user's role (from client to admin and viceversa)

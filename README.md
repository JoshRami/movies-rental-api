## Week 9 requiriments

This homework is the continuation of last week's homework.

Please as previous project, work on this on a new branch, and create an MR of the new branch towards the previous week work. Send both the repo and the link to the MR so we can see what has changed from the last week's work.

Base requirements

- [x] Users should be able to retrieve a list of movies sorted by Name or likes.
- [x] Users can filter the list by name, availability or tags (by default, all users should see only available movies).
  - [x] Request can combine these filters and sorters. So for example, If I query for movies with tags comedy | action and, whose name is avengers, and I sort them by likes, I've should get a movie (or a list of them!) who matches all of that criteria (if any!).
- [x] Users can see all the movies they have rented/bought
- [x] Admins can change a users' roles
- [x] A user should be able to buy/rent more than one movie on a single request
- [x] An email should be sent when a user requests to buy/rent movies. This email should contain all the information related to its order.
- [x] Users can change their password or reset it. (Change a password implies the user is logged in & knows his current password. Reset means that he no longer remembers which his password was)
- [x] When resetting a password, a user should receive an email with instructions to do it
- [x] The Nest.JS project should be Dockerized
- [x] Increase testing coverage to 80% (unit/integration)
- [x] Document your endpoints using Swagger

Extra points!

- [ ] Deploy your API to Heroku!
- [ ] Create a Docker compose file which sets up the Database & the NestJS project
- [x] Create a Git hook which lints & tests your API on each commit

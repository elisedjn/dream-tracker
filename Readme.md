# Dream-Tracker

## Description

Dream-Tracker is an application that helps you keep track on your dreams and share you favorite ones with other dreamers.
 
## User Stories

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault 
- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
- **homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup
- **sign up** - As a user I want to sign up on the webpage so that I can start register my dreams
- **login** - As a user I want to be able to log in on the webpage so that I can check all my dreams, record one and see the dreamflow
- **logout** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account
- **dream list** - As a user I want to see all my past dreams and search for specific ones (by date, categorie and status)
- **dream create** - As a user I want to record a new dream
- **dream details** - As a user I want to see the details of the dreams (mine or one from the dreamflow)
- **dreamflow** - As a user I want to be able to see all the public dreams and search for specific ones (by date and by categorie)

## Backlog

List of other features outside of the MVPs scope

Create a dream
- The user can choose between 10 random images when creating a dream. The selected image will be the background of this dream

Likes
- The users can rate other users public dreams by giving them a like
- The user can see the list of all this liked dreams
- The user can see if another one has liked his dream (anonymously)


## ROUTES:

- GET /
  - renders the homepage
- GET /auth/signup
  - renders the signup form
- POST /auth/signup
  - redirects to /auth/login
  - body:
    - username
    - email
    - password
- GET /auth/login
  - renders the login form
- POST /auth/login
  - redirects to /profile/:id
  - body:
    - email
    - password
- GET /profile/:id
  - renders the dashboard with the create form
- POST /profile/:id
  - redirects to /profile/:id/dreams
  - body:
    - recording
    - title
    - categories
    - description
    - date
 
- GET /profile/:id/dreams
  - renders dreams.hbs with the list and the search and anchor tags 
- POST /profile/:id/dreams (
  - redirects to /profile/:id/dreams
  - body:
    - Date
    - categories
    - Status (public or private)

- GET /profile/:id/dreams/:dreamId/edit
  - renders dream-edit.hbs with the edit form (same format as Dashboard)
- POST /profile/:id/dreams/:dreamId/edit
  - redirects to /profile/:id/dreams
  - body:
    - recording
    - title
    - categories
    - description
    - date
    - Status (public or private)

- GET /profile/:id/dreams/:dreamId (if the the user is looking at his own dream he will see edit and delete properties, else not)
  - renders dream-details.hbs (simlilar format to Dashboard)

- POST /profile/:id/dreams/:dreamId/delete
  - redirects to /profile/:id/dreams
  - body: (empty)

- GET /dreamflow
  - renders dreamflow.hbs with the list and the search and anchor tags 
- POST /dreamflow (
  - redirects to /dreamflow
  - body:
    - Date
    - categories

- POST /auth/logout
  - body: (empty)
  - redirects to /



## Models

- User: Schema {
	name: {
    type : string, 
    required: true,
    },
  email:  {
   type: String,
   required: true,
   unique: true }
  passwordHash: {
    type: String, 
    required: true
      },
  { timestamps: true} 
}
	
- Dream: Schema {
	title: {
	   type: String,
	   required: true
	},
	date: {
	   type: Date,
	   default: Date.now
     }
	description : String,
	categories : [{
      type : String
	    enum: [drama, action, romance, funny, fantastic, family, pets, fear, nightmare, adventure, childhood, XXX, food, job]
      }]
	status : {
	  type : String,
	  enum : [public, private]
    }
	recording: {
	  ??????????? MORE RESEARCH NEEDED
	}


## Links

### Trello

[Link to your trello board](https://trello.com/b/VKahAsiL/dream-tracker) 

### Git
 
[Repository Link](https://github.com/elisedjn/dream-tracker)

[Deploy Link](http://heroku.com)

### Slides

[Slides Link](http://slides.com)

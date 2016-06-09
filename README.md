#chord-composer-magik

##Technologies Used
+Full MEAN stack
  -__MongoDB__ and __Mongoose__, database
  -__Express__, back-end app
  -__AngularJS__, front-end framework
  -__Node.js__, server
+Third Party Javascript Libraries
  -__interact.js__, for Draggable DIVs
  -__raphael.chord.js__, for drawing chord tabs 
    *requires raphael.js (imported) and jQuery (included)
+Node Modules
  -__bCrypt__, password encryption
  -__body-parser__, RESTful API
  -__express__, back-end app
  -__express-jwt__, authentication
  -__jsonwebtoken__, authentication
  -__mongoose__, object document mapper for database
  -__path__, for serving public files
+AngularJS Modules
  -__ngResource__, AJAX calls to back-end
  -__ui.router__, state control with URL history

##Installation Instructions
1. Fork the repo from [github](https://github.com/joshgranadosin/chord-composer-magik)
2. Install the dependencies using __npm install__
3. Connect to a database by setting the __MONGODB_URI__ environment variable
4. Deploy to a server.

##Notes

###General Approach

In creating the app, planning was the first step. I kept the _user story_ in mind and only sought to solve the problem on hand: creating chord songsheets quickly and easily. I explored the feasibility using what technology, skills, and time I had available; I took a half day just trying things out to see if it was possible for me to make all of it in time. I planned out my database models and decided on MongoDB because I needed to store very long strings. I also created a user flow and wireframes since authentication was ultimately going to be a feature.

After planning was finished, I set up the skeleton of my app and built it up from there. I started with a server capable only of serving files. Then I built an angular app and the basic forms I would need. I tried out the important front-end features (draggable, printing) early. The back-end was then fleshed out to include mongoose models, and a simple API to call to it. Forms, authentication and completing links was next. Lastly, deployment and bug-checking.



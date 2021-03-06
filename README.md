#Chord Composer Magik

[Chord Composer Magik](http://i.imgur.com/umyqG3m.png)

##Technologies Used
+ Full MEAN stack
  * __MongoDB__ and __Mongoose__, database
  * __Express__, back-end app
  * __AngularJS__, front-end framework
  * __Node.js__, server
+ Third Party Javascript Libraries
  * __Sweet Alerts__, for alerts
  * __interact.js__, for Draggable DIVs
  * __raphael.chord.js__, for drawing chord tabs
    + requires raphael.js (imported) and jQuery (included)
+ Third Party Stylesheets
  * __Bootstrap__, for quick styling
  * __Normalize__, for consistent styling
  * __Sweet Alerts, for styling sweet alerts
+ Node Modules
  * __bCrypt__, password encryption
  * __body-parser__, RESTful API
  * __express__, back-end app
  * __express-jwt__, authentication
  * __jsonwebtoken__, authentication
  * __mongoose__, object document mapper for database
  * __path__, for serving public files
+ AngularJS Modules
  * __ngResource__, AJAX calls to back-end
  * __ui.router__, state control with URL history

##Installation Instructions
1. Fork the repo from [github](https://github.com/joshgranadosin/chord-composer-magik)
2. Install the dependencies using `npm install`.
3. Connect to a database by setting the `MONGODB_URI` environment variable
4. Deploy to a server.

##Notes

###General Approach

In creating the app, planning was the first step. I kept the _user story_ in mind and only sought to solve the problem on hand: creating chord songsheets quickly and easily. I explored the feasibility using what technology, skills, and time I had available; I took a half day just trying things out to see if it was possible for me to make all of it in time. I planned out my database models and decided on __MongoDB__ because I needed to store very long strings. I also created a user flow and wireframes since authentication was ultimately going to be a feature.

After planning was finished, I set up the skeleton of my app and built it up from there. I started with a server capable only of serving files. Then I built an angular app and the basic forms I would need. I tried out the important front-end features (draggable, printing) early. The back-end was then fleshed out to include mongoose models, and a simple API to call to it. Forms, authentication and completing links was next. Lastly, deployment and bug-checking.

###Things That Aren't Quite Done Yet

* User Experience

The app, from a _User Experience/User Interface_ point of view, is broken; there's nothing there to tell a user what to click, what to drag, what's editable, and what best practices are. It's a challenge that I'm not entirely sure how to solve. I don't know if pop-up tool tips, a short paragraph, or even a video would communicate what I need, or if a change in the actual UI is the best way to go.

* A Better Text Editor

While I don't want the text editor to have too many features (convention for speed over configuration), there are a few things I'd like the user to have control over, such as text size or font-family. Also, if I grab javascript libraries that offer full text editor capabilities, there's no guarantee that my printing function will still work correctly.

* Supporting flats

Right now, chords are only being generated as sharps and not flats. There are easy, but ineligant ways to solve this, but I would rather figure out how to do it right.

* ~~Deleting Chord Labels No Longer In the List~~

~~When a user removes a chord from the list, all instances of chord labels for that chord that was created should be removed from the document. I have a few ideas, but I wanted to get a minimum viable product out first.~~

###Challenges Faced While Making the App

* Draggables

Draggable chord labels are important feature, but it was challenging to integrate __interact.js__ into the app. Normally, it would run in a script file on document load, but because I used __AngularJS__ I had to put much of the code into an already bloated `controller.js` file. It was a pain trying to make it possible for users to drag elements from one section of the page into another while disallowing the dragging them to other sections.

The solution was a bit of a compromise. Instead of dragging from the left toolbar area, I would have the labels created by an event in the lyrics area where they will eventually need to be anyways. If I needed to drag them into the "trash" I would simply turn the restriction of the having them in the lyrics area off while they were in the "trash".

* User Authentication

For some reason, example codes I was given were not working as I expected for `jsonwebtoken` implementation. Though it seemed straight forward, I had to change the example code for things to work. Honestly, I just kept trying things until it worked exactly how I needed it to.

* Auto-save

I wanted to create an _auto-save_ feature. It sounded simple; just run a setInterval javascript to save to localStorage. Before I even started any coding, though, I had a hard time imagining how _recovery_ would be implemented, though. Is it something the user would manually decide after loading the composer page? Do I just try to recover if something was saved? What if they actually wanted to start over? I couldn't quite figure out the flow before even trying to implement so I decided to scrap it. In any case, I was hoping to make the app quick and easy enough for the user so that they wouldn't need auto-save.

#Development Documentation

##User Persona: Carlos

Carlos wrote some music for his band Soul Candy. They're meeting to practice soon, but he doesn't have his new songs written out in a way they can play them. He needs an easy way to create and print his lyrics with the chords in the right place.

##Link to other documentation

[Wireframes and User Flow](https://chordcomposermagik.herokuapp.com/about)




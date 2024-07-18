/*********************************************************************************
* WEB700 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Charmane Labatos    Student ID: 127192235    Date: 2024-07-17
*
* Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/


// Define the HTTP port to use (either from the environment variable or default to 8080)
var HTTP_PORT = process.env.PORT || 8080;

// Import the Express framework
var express = require("express");

// Import the path module to work with file and directory paths
const path = require("path");

// Create an instance of an Express application
var app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(path.resolve(), 'public')));

// Import the collegeData module
const collegeData = require('./modules/collegeData');

// Define the route for the home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Define the route for the about page
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Define the route for the HTML demo page
app.get("/htmlDemo", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'htmlDemo.html'));
});

// Define the route to get students (optionally by course)
app.get("/students", (req, res) => {
    if (req.query.course) {
        // If a course query parameter is provided, get students by course
        collegeData.getStudentsByCourse(req.query.course)
            .then((students) => {
                res.json(students);
            })
            .catch((err) => {
                res.json({ message: err });
            });
    } else {
        // If no course query parameter is provided, get all students
        collegeData.getAllStudents()
            .then((students) => {
                res.json(students);
            })
            .catch((err) => {
                res.json({ message: "No results" });
            });
    }
});

// Serve add student page
app.get('/students/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addStudent.html'));
});

// Add student
app.post('/students/add', (req, res) => {
    console.log('request body',req.body);
    collegeData.addStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch(err => {
        res.redirect('/students');
    });
});

// Define the route to get all TAs (Teaching Assistants)
app.get("/tas", (req, res) => {
    collegeData.getTAs()
        .then((tas) => {
            res.json(tas);
        })
        .catch((err) => {
            res.json({ message: "No results" });
        });
});

// Define the route to get all courses
app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err });
        });
});

// Define a route for the "/students/:num" URL to get a student by their number
app.get("/student/:num", function(req, res) {
    collegeData.getStudentsByNum(req.params.num)
        .then((students) => {
            res.json(students);
        })
        .catch((err) => {
            res.json({ message: err });
        });
});

// Catch-all route for handling 404 errors (page not found)
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Initialize the collegeData module and start the server
collegeData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => {
            console.log("Server listening on port " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.error(err);
    });

module.exports = app;

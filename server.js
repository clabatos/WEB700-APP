/*********************************************************************************
* WEB700 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Charmane Labatos    Student ID: 127192235    Date: 2024-07-17
*
* Online (Vercel) Link: https://web700-app-sepia.vercel.app/
*
********************************************************************************/


// Define the HTTP port to use (either from the environment variable or default to 8080)
var HTTP_PORT = process.env.PORT || 8080;

// Import the Express framework
var express = require("express");

// Import the express-handlebars module
const exphbs = require('express-handlebars');

// Import the path module to work with file and directory paths
const path = require("path");

// Create an instance of an Express application
var app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(path.resolve(), 'public')));

// Set up the handlebars engine
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
        }
    }
}));

app.set('view engine', '.hbs');

app.set('views', path.join(__dirname, 'views'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
   });

// Import the collegeData module
const collegeData = require('./modules/collegeData');

// Define the route for the home page
app.get("/", (req, res) => {
    res.render('home');
});

// Define the route for the about page
app.get("/about", (req, res) => {
    res.render('about');
});

// Define the route for the HTML demo page
app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
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
            .then((data) => {
                res.render("students", {students: data}); 
            })
            .catch((err) => {
                res.render("students", {message: "no results"});
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

app.get('/student/:num', (req, res) => {
    collegeData.getStudentsByNum(req.params.num)
        .then(data => {
            res.render("student", {student: data[0]});
        })
        .catch(err => {
            res.render("student", {message: "no results"});
        });
});

app.post('/student/update', (req, res) => {
    let studentNum = parseInt(req.body.studentNum, 10);
    let course = parseInt(req.body.course, 10);

    if (isNaN(studentNum) || isNaN(course)) {
        return res.status(400).send('Invalid input: studentNum and course must be numbers');
    }

    const updatedStudent = {
        studentNum: studentNum,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        addressStreet: req.body.addressStreet,
        addressCity: req.body.addressCity,
        addressProvince: req.body.addressProvince,
        TA: req.body.TA === 'on',
        status: req.body.status,
        course: course
    };

    collegeData.updateStudent(updatedStudent)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            res.redirect('/students');
            // res.status(500).send("Unable to update student: " + err);
        });
});

// Define the route to get all TAs (Teaching Assistants)
// app.get("/tas", (req, res) => {
//     collegeData.getTAs()
//         .then((tas) => {
//             res.json(tas);
//         })
//         .catch((err) => {
//             res.json({ message: "No results" });
//         });
// });

// Define the route to get all courses
app.get('/courses', (req, res) => {
    collegeData.getCourses()
        .then(data => {
            res.render("courses", {courses: data});
        })
        .catch(err => {
            res.render("courses", {message: "no results"});
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

const fs = require('fs');      //to import the fs module
const path = require('path');  


const studentFilePath = path.join(__dirname,'..', 'data', 'students.json');
const courseFilePath = path.join(__dirname,'..', 'data', 'courses.json');

class Data {                    
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

const initialize = () => {
    return new Promise((resolve, reject) => { 
        fs.readFile(studentFilePath, 'utf8', (err, studentData) => {        // When we read files asynchronously (which is what fs.readFile does),  
            if (err) {                                                             //it means that it starts reading the file, 
                reject("Unable to read students.json");                            //but we don't wait around for it to finish. Instead, 
                return;                                                            //we give it a function to call when it's done (the callback function).
            }
            let students = JSON.parse(studentData);

            fs.readFile(courseFilePath, 'utf8', (err, courseData) => {       //nesting fs.readfile so that the second file read only starts after the first one has completed.
                if (err) {
                    reject("Unable to read courses.json");
                    return;
                }
                let courses = JSON.parse(courseData);
                dataCollection = new Data(students, courses);       //This only runs after fs.readfile job is completed.
                resolve();
            });
        });
    });
};

const getAllStudents = () => {
    return new Promise((resolve, reject) => {
        if (dataCollection.students.length === 0) {
            reject("No results.");
        } else {
            resolve(dataCollection.students);
        }
    });
};

const getTAs = () => {
    return new Promise((resolve, reject) => {
        const TAs = dataCollection.students.filter(student => student.TA === true);
        if (TAs.length === 0) {
            reject("No results.");
        } else {
            resolve(TAs);
        }
    });
};

const getCourses = () => {
    return new Promise((resolve, reject) => {
        if (dataCollection.courses.length === 0) {
            reject("no results returned");
        } else {
            resolve(dataCollection.courses);
        }
    });
};

const getStudentsByCourse = (course) => {

    const selectedStudents = dataCollection.students.filter( student => student.course === parseInt(course));

    return new Promise((resolve, reject) => {
        if (selectedStudents.length > 0) {
            resolve(selectedStudents);
        } else {
            reject('No results returned');
        }
    })
}

const getStudentsByNum = (num) => {
    const selectedStudents = dataCollection.students.filter( student => student.studentNum === parseInt(num));
    return new Promise((resolve, reject) => {
        if (selectedStudents.length > 0) {
            resolve(selectedStudents);
        } else {
            reject('No results returned');
        }
    })
}

function addStudent(studentData) {
    return new Promise((resolve, reject) => {
        studentData.TA = studentData.TA !== undefined;
        studentData.studentNum = dataCollection.students.length + 1;
        dataCollection.students.push(studentData);
        
        fs.writeFile(studentFilePath, JSON.stringify(dataCollection.students, null, 2), (err) => {
            if (err) {
                console.log('Error',err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = {
    initialize,
    getAllStudents,
    getTAs,
    getCourses,
    getStudentsByCourse,
    getStudentsByNum,
    addStudent
};
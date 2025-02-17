const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"ava","password":"123"}];

const isValid = (username)=>{ 
    const userMatches = users.filter((user) => user.username === username);
    return userMatches.length > 0;
}
    /*
    let userswithsamename = users.filter((user)=>{
    return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }
    */


const authenticatedUser = (username,password)=>{
    const matchingUsers = users.filter((user) => user.username === username && user.password === password);
    return matchingUsers.length > 0;
}
    /*
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
    */


//only registered users can login
regd_users.post("/login", (req,res) => {
    console.log("login: ", req.body);
    const username = req.body.username;
    const password = req.body.password;
    
    //Return an error if the username or password is not provided
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    
    //if the credentials are correct, creates an access token that is valid for 1 hour (60 X 60 seconds) and logs the user in.
    //if the credentials are incorrect, throws an error
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
    
        req.session.authorization = {
            accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } 
    else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    //Write your code here
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.authorization.username;
    console.log("add review: ", req.params, req.body, req.session);
    if (books[isbn]) {
        let book = books[isbn];
        book.reviews[username] = review;
        return res.status(200).send("Review successfully posted");
    }
    else {
        return res.status(404).json({message: `ISBN ${isbn} not found`});
    }
});
  
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if (books[isbn]) {
        let book = books[isbn];
        delete book.reviews[username];
        return res.status(200).send("Review successfully deleted");
    }
    else {
        return res.status(404).json({message: `ISBN ${isbn} not found`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

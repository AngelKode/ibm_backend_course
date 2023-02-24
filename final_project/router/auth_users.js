const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");
const regd_users = express.Router();


let users = [{
    username : 'pedro',
    password : '1234pwd'
}];

const isValid = (username)=>{ //returns boolean
    let userFinded = users.find((user) => {
        return user.username === username
    })

    if(!userFinded){
        return false;
    }

    return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
    
    jwt.verify({
        username : username,
        password : password
    },'SECRET_JWT', (err,auth) => {

        if(err){
            return false;
        }

        let userFinded = users.find((user) => {
            return user.username === username && user.password === password;
        })

        if(!userFinded){
            return false;
        }
    
        return true;
    })
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username,password} = req.body;
  console.log(req.body)
  let userFinded = users.find((user) => {
    return user.username === username && user.password === password;
  })

  if(!userFinded){
      return res.status(401).send('Incorrect credentials');
  }

  let accessToken = jwt.sign(userFinded, 'SECRET_JWT',{
    algorithm : 'HS256'
    })

    req.session.authorization = {
        accessToken : accessToken,
        username : username,
        password : password
    }

  return res.status(200).json(
      {
        'token' : accessToken
      }
  )
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if(!authenticatedUser(req.session.authorization.username, req.session.authorization.password)){
    return res.status(401).send('You are not logged in.')
  }
  //We search the book and added the review
  let isbn = req.params.isbn;
  let bookEntries = Object.entries(books);
  let {reviews} = bookEntries.find(([key]) => key === isbn);

  if(!reviews){
    return res.status(401).send(`Cannot find the book with id ${isbn}`);
  }

  //Check if the actual user has uploaded another review
  let {review} = req.body;
  let reviewsEntries = Object.entries(reviews);
  let reviewOfCustomer = reviewsEntries.find(([key]) => key === req.session.authorization.username);

  review[req.session.authorization.username] = review;
  if(!reviewOfCustomer){
      return res.status(200).send('Review added');
  }

  return res.status(200).send('Review modified');

});

regd_users.delete("/auth/review/:isbn",(req,res) => {
    if(!authenticatedUser(req.session.authorization.username, req.session.authorization.password)){
        return res.status(401).send('You are not logged in.')
      }
      //We search the book and deleted the review
      let isbn = req.params.isbn;
      let bookEntries = Object.entries(books);
      let {reviews} = bookEntries.find(([key]) => key === isbn);
    
      if(!reviews){
        return res.status(401).send(`Cannot find the book with id ${isbn}`);
      }
    
      //Check if the actual user has uploaded another review
      let {review} = req.body;
      let reviewsEntries = Object.entries(reviews);
      let reviewOfCustomer = reviewsEntries.find(([key]) => key === req.session.authorization.username);
    
      if(!reviewOfCustomer){
          return res.status(200).send('Dont have reviews');
      }
      review[req.session.authorization.username] = undefined;
      return res.status(200).send('Review deleted');
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

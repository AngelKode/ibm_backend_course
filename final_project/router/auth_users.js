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

const authenticatedUser = (token)=>{ //returns boolean
    
    jwt.verify(token,'SECRET_JWT', (err,auth) => {
        console.log(err)
        if(err){
            return false;
        }

        return true;
    })
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username,password} = req.body;

  let userFinded = users.find((user) => {
    return user.username === username && user.password === password;
  })

  if(!userFinded){
      return res.status(401).send('Incorrect credentials');
  }

  let accessToken = jwt.sign({username : username, password : password}, 'SECRET_JWT',{expiresIn : '2h'});

    req.session.accessToken = accessToken;
    req.session.username = username;
    req.session.password = password;

  return res.status(200).json(
      {
        'token' : accessToken
      }
  )
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  if(authenticatedUser(req.session.accessToken)){
    return res.status(401).send('You are not logged in.')
  }

  if(!req.body.review){
    return res.status(401).send('Review body not sended');
  }

  //We search the book and added the review
  let isbn = req.params.isbn;
  let bookEntries = Object.entries(books);
  let [key,data] = bookEntries.find(([key]) => key === isbn);

  if(key === undefined && data === undefined){
    return res.status(401).send(`Cannot find the book with id ${isbn}`);
  }

  //Check if the actual user has uploaded another review
  let {review} = req.body;
  let {reviews} = data
  let reviewsEntries = Object.entries(reviews);
  let [,review_of_book] = reviewsEntries.find(([key]) => key === req.session.username) || [undefined, undefined];

  reviews[req.session.username] = review;

  if(!review_of_book){
      return res.status(200).send('Review added');
  }

  return res.status(200).send('Review modified');

});

regd_users.delete("/auth/review/:isbn",(req,res) => {
  if(authenticatedUser(req.session.accessToken)){
    return res.status(401).send('You are not logged in.')
  }

  //We search the book and added the review
  let isbn = req.params.isbn;
  let bookEntries = Object.entries(books);
  let [key,data] = bookEntries.find(([key]) => key === isbn);

  if(key === undefined && data === undefined){
    return res.status(401).send(`Cannot find the book with id ${isbn}`);
  }

  //Check if the actual user has uploaded another review
  let {review} = req.body;
  let {reviews} = data
  let reviewsEntries = Object.entries(reviews);
  let [,review_of_book] = reviewsEntries.find(([key]) => key === req.session.username) || [undefined, undefined];

  reviews[req.session.username] = undefined;

  if(!review_of_book){
      return res.status(200).send('Review not existed');
  }

  return res.status(200).send('Review deleted');
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

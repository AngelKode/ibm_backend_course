const express = require('express');
let books = null;
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    let {username, password} = req.body;

    if(!(username && password)){
        return res.status(401).send('Username and password not provided');
    }

    let isUserSigned = users.find(
      (user) => {
          return (user.username === username && user.password === password)
      })

    if(isUserSigned){
        return res.status(401).send('Username already registered. Choose other name');
    }
    
    users.push({
        username : username,
        password : password
    })
  return res.status(200).send('User succesfully registered ');
});

// Get the book list available in the shop
public_users.get('/',(req, res) => {
  let books_promise = new Promise((res,rej) => {
    books = require("./booksdb.js");
    res()
  })

  books_promise.then(() => {
    return res.status(300).json({...books});
  })
  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

    let promise_books = new Promise((res,rej) => {
        let _books = require("./booksdb.js");
        res(_books)
    })

    promise_books.then((data) => {
        let isbn = req.params.isbn;

        let bookEntries = Object.entries(data);

        let bookFiltered = bookEntries.filter(([key]) => key === isbn)
        let [, bookData] = bookFiltered.flat(1);
        return res.status(300).json(bookData);
    })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

    let promise_books = new Promise((res,rej) => {
        let _books = require("./booksdb.js");
        res(_books);
    })

    promise_books.then((data) => {
        let author = req.params.author;

        let bookEntries = Object.entries(data);
    
        let bookFiltered = bookEntries.filter(([,value]) => value.author.includes(author))
        let [, bookData] = bookFiltered.flat(1);
        return res.status(300).json(bookData);
    })
    
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

    let books_promise = new Promise((res,rej) => {
        let _books = require("./booksdb.js");
        res(_books);
    })

    books_promise.then((data) => {
        let title = req.params.title;

        let bookEntries = Object.entries(data);
    
        let bookFiltered = bookEntries.filter(([,value]) => 
                                                value.title.includes(title))
        let [, bookData] = bookFiltered.flat(1);
        return res.status(300).json(bookData);
    })
    
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;

    let bookEntries = Object.entries(books);

    let bookFiltered = bookEntries.filter(([key]) => key === isbn)
    let [, bookData] = bookFiltered.flat(1);
  return res.status(300).json({...bookData.reviews});
});

module.exports.general = public_users;

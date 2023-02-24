const express = require('express');
const cors = require('cors')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use(cors())
app.use("/customer/*",session({secret:"fingerprint_customer",resave: false, saveUninitialized: false}))

app.use("/customer/auth/*", function auth(req,res,next){

    next()

});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));

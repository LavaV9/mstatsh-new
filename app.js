const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const path = require("path");

const indexRoutes = require("./routes/index");
const itemRoutes = require("./routes/items");
const sellRoutes = require("./routes/sell");
const userRoutes = require("./routes/userRoutes");
const offerRoutes = require("./routes/offerRoutes"); // <-- Add this

const app = express();

// MongoDB Atlas Connection
const URI = "mongodb+srv://admin:admin123@cluster0.op61u.mongodb.net/project4?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(URI)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch(err => console.log(err.message));

// View Engine
app.set("view engine", "ejs");

// Static Files & Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Session and Flash Configuration
app.use(session({
  secret: "supersecretmonkeycode",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(flash());

// Flash + User Locals
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.errorMessages = req.flash("error") || [];
  res.locals.successMessages = req.flash("success") || [];
  res.locals.searchQuery = req.query.q || '';
  next();
});

// Routes
app.use("/", indexRoutes);
app.use("/items", itemRoutes);
app.use("/sell", sellRoutes);
app.use("/users", userRoutes);
app.use("/items/:id/offers", offerRoutes); // <-- Mount offer routes

// 404 Error Handler
app.use((req, res, next) => {
  let err = new Error("The server was not found " + req.url + ". Try a different part of the page.");
  err.status = 404;
  next(err);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const searchQuery = req.query.q || '';
  if (!err.status) {
    err.status = 500;
    err.message = "Internal server error. Something went wrong.";
  }
  console.error('Error:', err);
  res.status(err.status);
  res.render("error", {
    error: err,
    searchQuery: searchQuery
  });
});

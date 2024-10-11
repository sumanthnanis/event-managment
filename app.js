const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');
const routes = require('./routes');
const eventRoutes = require('./routes/event');
const fs = require('fs');
const app = express();

// Hardcoded MongoDB connection string
const MONGODB_URI = "mongodb+srv://sushanth123:sushanth123@sumanth1.apxwy1f.mongodb.net/knifee?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Set up session with hardcoded MongoDB URI for session storage
app.use(session({
  secret: "sumanth@8897414296",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: MONGODB_URI // Hardcoded MongoDB URI
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to make user available to all templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use routes
app.use('/', routes);
app.use('/', eventRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Event = require('../models/Event');



// Login routes
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// Signup routes
router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // You can optionally handle role assignment during signup here
    // For example, if an admin is signing up another admin, you might pass a role:
    const role = req.body.role || 'user';  // Default to 'user' if no role is provided

    const user = new User({ username, email, role });
    await User.register(user, password);  // Register user with passport-local-mongoose
    passport.authenticate('local')(req, res, () => {
      res.redirect('/');
    });
  } catch (error) {
    console.error(error);
    res.redirect('/signup');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

// Authorization middleware (optional)
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/');
}

router.get('/admin', isAdmin, (req, res) => {
  res.render('admin', { title: 'Admin Dashboard' });
});

module.exports = router;

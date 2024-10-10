const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

// GET Create Event Page
router.get('/create-event', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    res.render('create-event', { title: 'Create Event' });
  } else {
    res.redirect('/');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File name with timestamp
  }
});

const upload = multer({ storage });

// POST Create Event
router.post('/create-event', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, type, location, date, companyName, description } = req.body;
    const event = new Event({
      name,
      type,
      location,
      date,
      companyName, // Store company name from the form
      image: req.file.path, // Store the path of the uploaded image
      description,
      createdBy: req.user._id,
      isAdminEvent: true
    });
    await event.save();
    res.redirect('/my-events'); // Redirect to My Events page after creation
  } catch (error) {
    console.error(error);
    res.redirect('/create-event');
  }
});
// GET route for registered events
router.get('/registered-events', async (req, res) => {
    if (!req.isAuthenticated() || req.user.role === 'admin') {
        return res.redirect('/'); // Redirect if user is not authenticated or is an admin
    }

    try {
        const registeredEvents = await Event.find({ registeredUsers: req.user._id });
        res.render('registered-events', { title: 'Your Registered Events', events: registeredEvents, user: req.user });
    } catch (err) {
        console.error(err);
        res.render('registered-events', { title: 'Your Registered Events', events: [], user: req.user });
    }
});


function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.redirect('/');
  }
  router.get('/', async (req, res) => {
    try {
        const query = req.query.query || '';
        const typeFilter = req.query.type || '';
        const view = req.query.view || 'upcoming'; // Default view
        const sortBy = req.query.sort || ''; // New parameter for sorting

        // Fetch events based on type filter and search query
        const typeFilterQuery = typeFilter ? { type: typeFilter } : {};
        const events = await Event.find({
            ...typeFilterQuery,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } },
            ],
        });

        // Sort based on view parameter
        let sortedEvents;
        if (view === 'popular') {
            // Sort events by the number of registered users for "Most Popular"
            sortedEvents = events.sort((a, b) => b.registeredUsers.length - a.registeredUsers.length);
        } else {
            // Separate upcoming and past events
            const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
            const pastEvents = events.filter(event => new Date(event.date) <= new Date());

            // Sort based on the view parameter
            sortedEvents = view === 'upcoming' ? upcomingEvents : pastEvents;
        }

        res.render('home', { 
            title: 'Home', 
            events: sortedEvents, 
            query, 
            user: req.user, 
            typeFilter, 
            view,
            sortBy // Pass the sorting option to the template
        });

    } catch (err) {
        console.error(err);
        res.render('home', { title: 'Home', events: [], query: '', user: req.user });
    }
});
  
  // POST route for registering for an event
router.post('/register-event/:id', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).send('Event not found');
      }
  
      // Check if the user is an admin or already registered
      if (req.user.role === 'admin' || event.registeredUsers.includes(req.user._id)) {
        return res.status(403).send('Admins cannot register for their own events or you are already registered for this event.');
      }
  
      // Add the user to the registeredUsers array
      event.registeredUsers.push(req.user._id);
      await event.save();
  
      res.redirect('/my-events'); // Redirect to My Events or any other page
    } catch (err) {
      console.error(err);
      res.redirect('/my-events'); // Redirect on error
    }
  });
  
  
  // My Events route - show only events created by the logged-in admin
  router.get('/my-events', isAdmin, async (req, res) => {
    try {
      // Fetch only events created by the logged-in admin
      const events = await Event.find({ createdBy: req.user._id, isAdminEvent: true });
      res.render('my-events', { title: 'My Events', events });
    } catch (err) {
      console.error(err);
      res.render('my-events', { title: 'My Events', events: [] });
    }
  });

// GET route for event details
router.get('/event/:id', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (event) {
        res.render('event-detail', { title: event.name, event });
      } else {
        res.status(404).send('Event not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
  // GET route for editing an event
router.get('/edit-event/:id', isAdmin, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (event && event.createdBy.equals(req.user._id)) {
        res.render('edit-event', { title: 'Edit Event', event });
      } else {
        return res.redirect('/my-events'); // Redirect if event not found or not created by admin
      }
    } catch (err) {
      console.error(err);
      res.redirect('/my-events');
    }
  });
  
  // POST route for updating an event
  router.post('/edit-event/:id', isAdmin, async (req, res) => {
    try {
      const { name, type, location, description } = req.body;
      const event = await Event.findById(req.params.id);
      if (event && event.createdBy.equals(req.user._id)) {
        event.name = name;
        event.type = type;
        event.location = location;
        event.description = description;
        await event.save();
        res.redirect('/my-events'); // Redirect to My Events after saving
      } else {
        return res.redirect('/my-events');
      }
    } catch (err) {
      console.error(err);
      res.redirect('/my-events');
    }
  });
  

// DELETE route for deleting an event
router.post('/delete-event/:id', isAdmin, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (event && event.createdBy.equals(req.user._id)) {
        await Event.findByIdAndDelete(req.params.id); // Delete the event
        res.redirect('/my-events'); // Redirect to My Events after deletion
      } else {
        return res.redirect('/my-events');
      }
    } catch (err) {
      console.error(err);
      res.redirect('/my-events');
    }
  });
  
  
  

module.exports = router;

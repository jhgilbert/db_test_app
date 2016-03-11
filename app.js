var express = require('express');
var app = express();
var session = require('express-session');
app.use(session({secret:'NotActuallySecretAtAll'}));

// override with the _method param in the URL
var methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Handlebars templating
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Port and static handling
app.set('port', 8008);
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Add parsing for POST requests
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Routes
app.get('/', function(req, res) {
  res.redirect("/workouts");
});

app.get('/workouts', function(req, res) {
  if (!req.session.workouts) {
    req.session.workouts = [];
  }
  context = {workouts: req.session.workouts};
  res.render("index", context);
});

app.post('/workouts', function(req, res) {
  console.log(req.body);
  var newWorkout = req.body;
  newWorkout.id = req.session.workouts.length;
  req.session.workouts.push(newWorkout);
  res.send(newWorkout.id.toString());
});

app.get('/workouts/:id/edit', function(req, res) {
  var id = parseInt(req.params.id);
  var context = {};
  for (var i = 0; i < req.session.workouts.length; i++) {
    var workout = req.session.workouts[i];
    if (workout.id == id) {
      workoutToEdit = workout;
    }
  }
  context.workout = workoutToEdit;
  res.render("edit", context);
});

app.put('/workouts/:id', function(req, res) {
  console.log(req.body, "body");
  console.log(req.params, "params");
  console.log(req.query, "query");
  var id = parseInt(req.params.id);
  for (var i = 0; i < req.session.workouts.length; i++) {
    var workout = req.session.workouts[i];
    if (workout.id == id) {
      var updatedWorkout = req.body;
      if (!updatedWorkout.lbs) {
        updatedWorkout.lbs = false;
      } else {
        updatedWorkout.lbs = true;
      }
      updatedWorkout.id = id;
      req.session.workouts[i] = updatedWorkout;
    }
  }
  res.redirect("/workouts");
});

app.delete('/workouts/:id', function(req, res) {
  var id = parseInt(req.params.id);
  for (var i = 0; i < req.session.workouts.length; i++) {
    var workout = req.session.workouts[i];
    if (workout.id == id) {
      req.session.workouts.splice(i, 1);
    }
  }
  res.redirect("/workouts"); 
});

// ADD ERROR HANDLERS HERE

// Listen on designated port
app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl+C to terminate.');
});

var express = require('express');
var app = express();

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

// Connect to database
var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'FILL IN HERE',
  password: 'FILL IN HERE',
  database: 'student'
});

// Database reset route

app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.redirect("/workouts");
    });
  });
});

// Routes
app.get('/', function(req, res) {
  res.redirect("/workouts");
});

app.get('/workouts', function(req, res) {
  var context = {};
  pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if (err) {
      console.log(err);
    }
    context.workouts = rows;
    res.render("index", context);
  });
});

app.post('/workouts', function(req, res) {
  var newWorkout = req.body;
  var lbsVal;
  if (newWorkout.lbs) {
    lbsVal = 1;
  } else {
    lbsVal = 0;
  }
  pool.query("INSERT INTO workouts(name, weight, lbs, date, reps) VALUES (?,?,?,?,?)", [newWorkout.name, newWorkout.weight, lbsVal, newWorkout.date, newWorkout.reps], function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.send(JSON.stringify(result.insertId));
  });
});

app.get('/workouts/:id/edit', function(req, res) {
  var id = parseInt(req.params.id);
  var context = {};
  pool.query("SELECT * FROM workouts WHERE id=?", id, function(err, result){
    if(err){
      console.log(err);
      return;
    }
    if(result.length == 1){
      context.workout = result[0];
      context.workout.date = context.workout.date.toISOString().substring(0, 10);
      res.render("edit", context);
    }
  });
});

app.put('/workouts/:id', function(req, res) {
  var id = parseInt(req.params.id);
  pool.query("SELECT * FROM workouts WHERE id=?", id, function(err, result){
    if(err){
      console.log(err);
      return;
    }
    if(result.length == 1){
      var currentValues = result[0];
      var lbsValue;
      if (req.body.lbs) {
        lbsValue = true;
      } else {
        lbsValue = false;
      }
      pool.query("UPDATE workouts SET name=?, reps=?, weight=?, lbs=?, date=? WHERE id=? ",
        [req.body.name || currentValues.name, req.body.reps || currentValues.reps, req.body.weight || currentValues.weight, lbsValue, req.body.date || currentValues.date, id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        res.redirect("/workouts");
      });
    }
  });
});

app.delete('/workouts/:id', function(req, res) {
  var id = parseInt(req.params.id);
  pool.query("DELETE * FROM workouts WHERE id=?", id, function(err, result) {
    if (err) {
      console.log(err);
      res.send("ERROR");
    }
    res.send("OK");
  });
});

// ADD ERROR HANDLERS HERE

// Listen on designated port
app.listen(app.get('port'), function() {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl+C to terminate.');
});

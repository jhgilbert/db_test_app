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
    })
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
  pool.query("INSERT INTO workouts(name) VALUES (?)", newWorkout.name, function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    res.send(JSON.stringify(result.insertId));
  });
  /*
  console.log(req.body);
  var newWorkout = req.body;
  newWorkout.id = req.session.workouts.length;
  req.session.workouts.push(newWorkout);
  res.send(newWorkout.id.toString());
  */
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
      pool.query("UPDATE workouts SET name=?, weight=?, lbs=? WHERE id=? ",
        [req.body.name || currentValues.name, req.body.weight || currentValues.weight, lbsValue, id],
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

// Dependencies and declarations
var express = require('express');
var request = require('request');
var app = express();
var API_URL = 'https://api.brewerydb.com/v2/';
// var API_KEY = '600b7b4f3fed5a4db8fb96a8b599630e'; // SEAN
var API_KEY = '3e9697256a3560bcd2bd05d03483ce99'; // PATRICK

// index route
app.get('/', function(req,res) {
 res.sendFile(__dirname + '/views/index.html');
});

// Due to CORS issues we have to use a proxy to overcome in Express or build out a back end.
// This. This is why we can't have nice things.
app.get('/api', function(req, res){
  request(API_URL + '?key=' + API_KEY, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body);
    }
   });
});

app.get('/abvrange', function(req, res) {
  request(API_URL + 'beers/key?=' + API_KEY + '&abv=6,8', function(error, response, body) {
    if (!error && response.statusCode === 200) {
      res.send(body);
    }
  });
});

// Add some pointers to static directories. We then need to follow through in our HTML, see index for an example.
app.use(express.static(__dirname + '/scripts'));
app.use(express.static(__dirname + '/styles'));

// Feel free to change the port but I doubt you'll have a conflict.
// Just go to http://localhost:8080 and you're good to go!
app.listen(8080, function () {
  console.log('App listening on port 8080!');
});

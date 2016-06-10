"use scrict";

var BrewAPI = function() {};

var KEY = '600b7b4f3fed5a4db8fb96a8b599630e';

BrewAPI.prototype.init = function() {
  console.log("WOOT!!!!");
  this.setElementCache();
  this.bindEvents();
}

BrewAPI.prototype.setElementCache = function() {}

BrewAPI.prototype.bindEvents = function() {}

BrewAPI.prototype.getBeers = function() {
  $.ajax({
    method: 'get',
    url: 'http://api.brewerydb.com/v2/beers?key=6f082a3b561effcd62762f7a86bfb333&abv=4'
  })
  .done(function(results){
    console.log('Hello results!', results);
  })
  .error(function(error){
    console.log(error);
  });
}

$(document).ready(function() {
  var brewAPI = new BrewAPI();
  brewAPI.init();
});
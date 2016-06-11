"use strict";

var BrewAPI = function() {};


// var KEY = '600b7b4f3fed5a4db8fb96a8b599630e'; // SEAN
// var KEY = '3e9697256a3560bcd2bd05d03483ce99'; // PATRICK
var KEY = '600b7b4f3fed5a4db8fb96a8b599630e'; // Morgan
var API = 'http://api.brewerydb.com/v2/';


BrewAPI.prototype.init = function() {
  this.setElementCache();
  this.bindEvents();
}

BrewAPI.prototype.setElementCache = function() {}

BrewAPI.prototype.bindEvents = function() {
  var context = this;
  $('#findBeer').click(function() {
    event.preventDefault();
    event.stopPropagation();
    context.getSearchCriteria();
  });
}

BrewAPI.prototype.getSearchCriteria = function() {
  var searchString = $('#search-beer').val();
  var encodedSearchParam = encodeURIComponent(searchString);
  this.getBeers(encodedSearchParam);
}

BrewAPI.prototype.getBeers = function(encodedSearchParam) {
  var context = this;
  $.ajax({
    method: 'get',
    url: API + 'beers/?key=' + KEY + '&name=' + encodedSearchParam + '&withBreweries=Y'
  })
  .done(function(results) {
    $('.empty_state_wrapper').hide();
    var returnBeer = results.data[0];
    if (results.data.length > 1) {
      plotResults(returnBeer, results.data);
    }
    else {
      context.getRelatedBeers(returnBeer);
    }
  });
}

BrewAPI.prototype.getRelatedBeers = function(returnBeer) {
  var abvRangeLow = parseInt(returnBeer.abv) - 1;
  var abvRangeHigh = parseInt(returnBeer.abv) + 1;
  var ibuRangeLow = parseInt(returnBeer.ibu) - 10;
  var ibuRangeHigh = parseInt(returnBeer.ibu) + 10;
  var context = this;
  $.ajax({
    method: 'get',
    url: API + 'beers/?key=' + KEY + '&abv=' + abvRangeLow + ',' + abvRangeHigh + '&ibu=' + ibuRangeLow + ',' + ibuRangeHigh + '&withBreweries=Y'
  })
  .done(function(results) {
    plotResults(returnBeer, results.data);
  });
}


var searchSimilar = function(tooltipObject) {
  var searchString = tooltipObject.name;
  var encodedTooltipBeer = encodeURIComponent(searchString);
  BrewAPI.prototype.getBeers(encodedTooltipBeer);
}

var tooltip;
var tooltipObject;

function plotResults(selectedbeer, resultdata) {

  //find the range or ibu and abv values in the data set
  var xrange = [d3.min(resultdata, function(d){return d.abv}), d3.max(resultdata, function(d){return d.abv})];
  var yrange = [d3.min(resultdata, function(d){return d.ibu}), d3.max(resultdata, function(d){return d.ibu})];
  //find midpoint of the ranges to set at the middle of the chart
  var xmid = (xrange[1]-xrange[0])/2;
  var ymid = (yrange[1]-yrange[0])/2;

  //find center of the chart
  var centerabv = parseFloat(selectedbeer.abv);
  var centeribu = parseFloat(selectedbeer.ibu);

  var xstretch = 1.1*Math.max(centerabv-xrange[0], xrange[1]-centerabv);
  var ystretch = 1.1*Math.max(centeribu-yrange[0], yrange[1]-centeribu);

  var width = 1400;
  var height = 806;


    // x and y scales, I've used linear here but there are other options
  // the scales translate data values to pixel values for you
  var x = d3.scale.linear()
            .domain([centerabv-xstretch, centerabv+xstretch])  // the range of the values to plot
            .range([ 0, width ]);        // the pixel range of the x-axis

  var y = d3.scale.linear()
            .domain([centeribu-ystretch, centeribu+ystretch])
            .range([ height, 0 ]);

  // the chart object, includes all margins
  d3.select('.chart').remove();
  var chart = d3.select('#chart')
    .append('svg:svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'chart');

  //tooltip
  tooltip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    tooltipObject = d;
    var img = "<img src='beer.png' class='beer_avatar'/>";
    if (d.labels != null && d.labels.medium != null) {
      img = "<img src='"+d.labels.medium+"' class='beer_avatar_medium'/>";
    }
    return "<a class='button_close' href='#' onclick='tooltip.hide();return false;'>&#43;</a><div class='tip_content_wrapper'><div class='col col_left'>"+img+"</div><div class='col col_right'><h3>"+d.name+"</h3><p class='label_beer_type'>"+d.style.shortName+"</p><p class='label_beer_attributes'>"+d.ibu+" <span>IBU</span> "+d.abv+"<span>ABV</span></p><p class='button_similar'><p class='button_similar'><a href='#' onclick='searchSimilar(tooltipObject);tooltip.hide();return false;'>Find Similar</a></p></div>";
  })
  chart.call(tooltip);
  var main = chart.append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main');

  //add background radial
  var defs = chart.append('defs');
  var radial = defs.append('radialGradient').attr("id", "backgrad");
  radial.append("stop").attr("offset", "0%").attr("stop-color", "#3e3e3e");
  radial.append("stop").attr("offset", "100%").attr("stop-color", "#070707");
  main.append("circle")
    .attr("fill", "url(#backgrad)")
    .attr("cx", width/2)
    .attr("cy", height/2)
    .attr("r", width/2);


  /*
    // draw the x axis
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis);

    // draw the y axis
  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis);
  */
    // draw the graph object
  var g = main.append("svg:g");

  g.selectAll("rings")
    .data([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18])  // using the values in the ydata array
    .enter().append("svg:circle")  // create a new circle for each value
        .attr("class", "ring")
        .attr("cx", width/2 ) // translate x value
        .attr("cy", height/2 ) // translate y value to a pixel
        .attr("r", function (d) { return d*50 }); // radius of circle // radius of circle

  g.selectAll("scatter-dots1")
    .data(resultdata)  // using the values in the ydata array
    .enter().append("svg:circle")  // create a new circle for each value
        .attr("class", "outerdot")
        .attr("cx", function (d) { return x(d.abv); } ) // translate x value
        .attr("cy", function (d) { return y(d.ibu); } ) // translate y value to a pixel
        .attr("r", 10)
        .attr("onmouseover","evt.target.setAttribute('r', '15');")
        .attr("onmouseout","evt.target.setAttribute('r', '10');")
        .on("mouseup", tooltip.show);

  g.selectAll("scatter-dots2")
    .data(resultdata)  // using the values in the ydata array
    .enter().append("svg:circle")  // create a new circle for each value
        .attr("class", "innerdot")
        .attr("cx", function (d) { return x(d.abv); } ) // translate x value
        .attr("cy", function (d) { return y(d.ibu); } ) // translate y value to a pixel
        .attr("r", 4); // radius of circle // radius of circle

  //add legend
  main.append("text")
    .attr("class", "legend-label")
    .attr("x", (width/2))
    .attr("y", 70)
    .text("More Bitter");
  main.append("text")
    .attr("class", "legend-sub-label ")
    .attr("x", (width/2))
    .attr("y", 100)
    .text("High IBU");
  main.append("text")
    .attr("class", "legend-label")
    .attr("x", (width/2))
    .attr("y", height-50)
    .text("Less Bitter");
  main.append("text")
    .attr("class", "legend-sub-label")
    .attr("x", (width/2))
    .attr("y", height-20)
    .text("Less IBU");
  main.append("text")
    .attr("class", "legend-label legend-label-left")
    .attr("x", 90)
    .attr("y", height/2)
    .text("Light");
  main.append("text")
    .attr("class", "legend-sub-label legend-sub-label-left")
    .attr("x", 90)
    .attr("y", (height/2)+30)
    .text("Low ABV");
  main.append("text")
    .attr("class", "legend-label legend-label-right")
    .attr("x", width-100)
    .attr("y", height/2)
    .text("Strong");
  main.append("text")
    .attr("class", "legend-sub-label legend-sub-label-right")
    .attr("x", width-100)
    .attr("y", (height/2)+30)
    .text("High ABV");

  //add information about selected beer
  main.append("text")
    .attr("class", "chart-text-value")
    .attr("x", (width/2)-120)
    .attr("y", (height/2)-20)
    .text(selectedbeer.ibu);
  main.append("text")
    .attr("class", "chart-text-label")
    .attr("x", (width/2)-110)
    .attr("y", (height/2)-20)
    .text("IBU");
  main.append("text")
    .attr("class", "chart-text-value")
    .attr("x", (width/2)-120)
    .attr("y", (height/2)+40)
    .text(selectedbeer.abv);
  main.append("text")
    .attr("class", "chart-text-label")
    .attr("x", (width/2)-110)
    .attr("y", (height/2)+40)
    .text("ABV");
  main.append("image")
    .attr("xlink:href", "beer.png")
    .attr("x", (width/2)-51)
    .attr("y", (height/2)-110)
    .attr("width", 102)
    .attr("height", 210);
  main.append("text")
    .attr("class", "chart-text-label beer-style")
    .attr("x", (width/2)+80)
    .attr("y", (height/2)-20)
    .text(selectedbeer.style.name);
  main.append("text")
    .attr("class", "chart-text-label brewery-name")
    .attr("x", (width/2)+80)
    .attr("y", (height/2)+40)
    .text(selectedbeer.breweries[0].name);
  main.append("text")
    .attr("class", "chart-text-label beer-name")
    .attr("x", (width/2))
    .attr("y", (height/2)-150)
    .text(selectedbeer.name);
}

$(document).ready(function() {
  var brewAPI = new BrewAPI();
  brewAPI.init();
  //brewAPI.getBeers();
});

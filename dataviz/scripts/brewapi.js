"use strict";

var fatTire = '{"id":"tuqTtX","name":"Fat Tire","nameDisplay":"Fat Tire","abv":"5.2","ibu":"18.5","glasswareId":5,"srmId":11,"availableId":1,"styleId":32,"isOrganic":"N","labels":{"icon":"https://s3.amazonaws.com/brewerydbapi/beer/tuqTtX/upload_L6CVSL-icon.png","medium":"https://s3.amazonaws.com/brewerydbapi/beer/tuqTtX/upload_L6CVSL-medium.png","large":"https://s3.amazonaws.com/brewerydbapi/beer/tuqTtX/upload_L6CVSL-large.png"}}';

var BrewAPI = function() {};

var KEY = '600b7b4f3fed5a4db8fb96a8b599630e';

BrewAPI.prototype.init = function() {
  this.setElementCache();
  this.bindEvents();
}

BrewAPI.prototype.setElementCache = function() {}

BrewAPI.prototype.bindEvents = function() {}

BrewAPI.prototype.getBeers = function() {
  $.ajax({
    method: 'get',
    url: 'http://api.brewerydb.com/v2/beers/?key=6f082a3b561effcd62762f7a86bfb333&ibu=17,20&abv=4,6&styleId=32'
  })
  .done(function(results){
    //console.log('Hello results!', results);
    plotResults(eval('('+fatTire+')'), results.data);
  })
  .error(function(error){
    console.log(error);
  });
}

var tooltip;
var tooltipObject;

function searchSimilar(beer){
  //todo, fill in the functionality when searching for similar beers from tooltip

  console.log(beer);
  //call plotResults with beer object and resultdata of similarbeer
}

function plotResults(selectedbeer, resultdata) {
  console.log(selectedbeer);
  console.log(resultdata);

  //find the range or ibu and abv values in the data set
  var xrange = [d3.min(resultdata, function(d){return d.abv}), d3.max(resultdata, function(d){return d.abv})];
  var yrange = [d3.min(resultdata, function(d){return d.ibu}), d3.max(resultdata, function(d){return d.ibu})];
  //find midpoint of the ranges to set at the middle of the chart
  var xmid = (xrange[1]-xrange[0])/2;
  var ymid = (yrange[1]-yrange[0])/2;

  //find center of the chart
  var centerabv = parseFloat(selectedbeer.abv);
  var centeribu = parseFloat(selectedbeer.ibu);

  var width = 1400;
  var height = 806;


    // x and y scales, I've used linear here but there are other options
  // the scales translate data values to pixel values for you
  var x = d3.scale.linear()
            .domain([centerabv-xmid, centerabv+xmid])  // the range of the values to plot
            .range([ 0, width ]);        // the pixel range of the x-axis

  var y = d3.scale.linear()
            .domain([centeribu-ymid, centeribu+ymid])
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
    var img = "<img src='beer.png' align='left' style='margin-right:20px' width='32' height='70'/>";
    if (d.labels != null && d.labels.medium != null) {
      img = "<img src='"+d.labels.medium+"' align='left' style='margin-right:20px' width='70' height='70'/>";
    }
    return "<a style='position:relative;float:right' href='#' onclick='tooltip.hide();return false;'>X</a><p style='padding:20px'>"+img+"<span><strong>"+d.name+"</strong><br/>"+d.style.shortName+"<br/><br/><strong>"+d.ibu+"</strong> IBU <strong>"+d.abv+"</strong> ABV</span><br/><br/><a href='#' onclick='searchSimilar(tooltipObject);tooltip.hide();return false;'>Find Similar</a></span></p>";
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
    .attr("class", "legend-label")
    .attr("x", (width/2))
    .attr("y", height-20)
    .text("Less Bitter");
  main.append("text")
    .attr("class", "legend-label")
    .attr("x", 90)
    .attr("y", height/2)
    .text("Light");
  main.append("text")
    .attr("class", "legend-label")
    .attr("x", width-100)
    .attr("y", height/2)
    .text("Strong");

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

}

$(document).ready(function() {
  var brewAPI = new BrewAPI();
  brewAPI.init();
  brewAPI.getBeers();
});

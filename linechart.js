//SETS BOUNDS for the chart (axis)
var margin = {top: 30, right: 30, bottom: 70, left: 40},
    width = 500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// SET RANGES OF SCALE
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// DEFINES AXIS DETAILS
var xAxis1 = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);
var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

var color = d3.scale.category20();   // set the colour scale

//** SPECIFIC TO MAKING LINE CHART **
// Define the line 
var line = d3.svg.line() 
    .x(function(d) { return x(d.fraction); })
    .y(function(d) { return y(d.tenure); });
    
// ADD SVG TO DISPLAY (cannot be named svg or else would over lap it)
var linechart = d3.select("#area1")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// IMPORTING DATA (CSV FILE)
d3.csv("spend30more.csv", function(error, data) {
    data.forEach(function(d) {
        d.income = d.income;
        d.fraction = +d.fraction;
        d.tenure = +d.tenure;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.fraction; }));
    y.domain([0, d3.max(data, function(d) { return d.tenure; })]);

    //** SPECIFIC TO MAKING LINE CHART **
    // Nest the entries by city (GEO_NAME)
    var dataNest = d3.nest()
        .key(function(d) {return d.GEO_NAME;})
        .entries(data);

        // .entries(data) returns an array that can be used with map or forEach but .object(data) returns a direct object with the values

    // Loop through each GEO_NAME / provide different colour key
    dataNest.forEach(function(d,i) { 

        linechart.append("path")
            .attr("class", "line")
            .style("stroke", function() { // Add the colours dynamically
                return d.color = color(d.key); })
            .attr("d", line(d.values))
    });


//CREATE AXIS
    // Add the X Axis
    linechart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    linechart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    //HOVER OVER LINE. SHOW INFO. At the moment shows the "highest" point of all the points for that city.. need to figure out how to show just the points.
    linechart.selectAll("path")
          .data(data)
        .append("title")
        .text(function(d) {
            return d.tenure + " tenure " + d.fraction + " fraction" + d.income + " income range" + d.GEO_NAME;

          });


});
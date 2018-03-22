//SETS BOUNDS for the chart (axis)
var margin = {top: 30, right: 50, bottom: 50, left: 70},
    width = 550 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// SET RANGES OF SCALE
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

//COLOUR RANGE
// var color = d3.scale.category20();

// DEFINES AXIS DETAILS
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10);
var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(10);


// ADD SVG TO BODY OF HTML TO DISPLAY
var svg = d3.select("#area2")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

//** SPECIFIC TO MAKING SCATTER PLOT **
// group that will contain all of the plots
    var groups = svg.append("g").attr("transform", "translate(0)");


// IMPORTING DATA (CSV FILE)
d3.csv("spend30more.csv", function(error, data) {
    data.forEach(function(d) {
        d.income = d.income;
        d.fraction = +d.fraction;
        d.tenure = +d.tenure;
    });
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.fraction; }));
   //x.domain(["Under $10k", "$10k to $19,999", "$20k to $29,999", "$30k to $39,999", "$40k to $49,999", "$50k to $59,999", "$60k to $69,999", "$70k to $79,999", "$80k to $89,999", "$90k to $99,999", "$100k and over"])
    y.domain([0, d3.max(data, function(d) { return d.tenure; })]);

//** SPECIFIC TO MAKING SCATTER PLOT **
    // Add the scatterplot
    var circles =
    groups.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 3) // how big the circles will be
        .attr("cx", function(d) { return x(+d.fraction); })
        .attr("cy", function(d) { return y(+d.tenure); })
        .attr("id", function(d) { return d.GEO_NAME;})
        .style("fill", function(d) { return "red"; });

//CREATE AXIS
    // X-AXIS
    // appends 'g' element to the SVG. g is used to group SVG shapes together
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .attr("font-size","9px")
        .call((xAxis)   
            .ticks(10) // set details on their ticks on x-axis
            .tickSubdivide(true)
            .tickSize(10, 10, 10)
            .orient("bottom")) 

        .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("font-size","12px")
            .attr("y", -8) //how far away the small text should be from the axis line
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("Fraction of people");
            //.text("How much is spent on housing ($)");
    
    // Y-AXIS
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)") //rotate text to y-axis to read
            .attr("y", 16) //how far away the small text should be from the axis line
            .style("text-anchor", "end")
            .style("font-weight", "bold")
            .text("Tenure");
            //.text("Fraction of the total population spending > 30% on housing");


});
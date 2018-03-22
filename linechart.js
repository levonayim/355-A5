function iGToInt(iG) {
    if (iG == 'Under $10,000') {
        return 0;
    } else if (iG == '$10,000 to $19,999') {
        return 1;
    } else if (iG == '$20,000 to $29,999') {
        return 2;
    } else if (iG == '$30,000 to $39,999') {
        return 3;
    } else if (iG == '$40,000 to $49,999') {
        return 4;
    } else if (iG == '$50,000 to $59,999') {
        return 5;
    } else if (iG == '$60,000 to $69,999') {
        return 6;
    } else if (iG == '$70,000 to $79,999') {
        return 7;
    } else if (iG == '$80,000 to $89,999') {
        return 8;
    } else if (iG == '$90,000 to $99,999') {
        return 9;
    } else if (iG == '$100,000 and over') {
        return 10;
    }   
}

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


    
// ADD SVG TO DISPLAY (cannot be named svg or else would over lap it)
var linechart = d3.select("#area1")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

// IMPORTING DATA (CSV FILE)
d3.csv("A5-query.csv", function(error, data) {
    data.forEach(function(d) {
        // PREPARE DATA
        d.name = d.name;
        d.incomeGroup = d.incomeGroup;
        d.houseType = d.houseType;
        d.costIncomeRatio = d.costIncomeRatio;

        // converts to number or 0
        d.tenureOwner = +d.tenureOwner || 0;
        d.tenureRenter = +d.tenureRenter || 0;
        d.tenureBand = +d.tenureBand || 0;
    });

    
    var dataNest = d3
        // nest by name, then incomeGroup
        .nest()
        .key(function(d) { return d.name; })
        .key(function(d) { return d.incomeGroup; })
        // for each subgroup
        .rollup(function(d) {
            // return a set of calculated values
            var total = d3.sum(d, function(d) { 
                var total = d3.sum([d.tenureOwner, d.tenureRenter, d.tenureBand]);
                return total;
            });
            var under30 = d3.sum(d, function(d) {
                var total = d3.sum([d.tenureOwner, d.tenureRenter, d.tenureBand]);
                if (d.costIncomeRatio == 'Spending less than 30% of income on shelter costs') {
                    return total;
                } else {
                    return 0;
                }
            });
            var ratio = under30 / total;
            var percent = ratio * 100;

            // as an object
            return {
                total: total,
                under30: under30,
                ratio: ratio,
                percent: percent,
            };
        })
        // supply dataset
        .entries(data);
    

    dataNest.forEach(function(d) {
        d.values.sort(function(x, y) {
            return d3.ascending(iGToInt(x.key), iGToInt(y.key));
        });
    });

    console.log(JSON.stringify(dataNest));

    // Scale the range of the data
    // x min to max
    x.domain([
        // min of
        d3.min(dataNest, function(d) { 
            // min of incomeGroup index
            var n = d3.min(d.values, function(d) {
                return iGToInt(d.key);
            });
            return n; 
        }),
        // max of
        d3.max(dataNest, function(d) { 
            // max of incomeGroup index
            var n = d3.max(d.values, function(d) {
                return iGToInt(d.key);
            });
            return n; 
        })
    ]);

    y.domain([0, 
        // max of
        d3.max(dataNest, function(d) { 
            // max of incomeGroup percent
            var n = d3.max(d.values, function(d) {
                return d.values.percent;
            });
            return n; 
        })
    ]);


    //** SPECIFIC TO MAKING LINE CHART **
    // Define the line 
    var line = d3.svg.line() 
        .x(function(d) { return x(iGToInt(d.key)); })
        .y(function(d) { return y(d.values.percent); });

    //** SPECIFIC TO MAKING LINE CHART **
    // Nest the entries by city (GEO_NAME)
    // var dataNest = d3.nest()
    //     .key(function(d) {return d.GEO_NAME;})
    //     .entries(data);

        // .entries(data) returns an array that can be used with map or forEach but .object(data) returns a direct object with the values

    // Loop through each GEO_NAME / provide different colour key
    dataNest.forEach(function(d,i) { 
        linechart.append("path")
            .attr("class", "line")
            .style("stroke", function() { // Add the colours dynamically
                return d.color = color(d.key); })
            .attr("d", line(d.values));
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
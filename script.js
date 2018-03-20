// DIMENSIONS
var margin = {top: 30, right: 50, bottom: 50, left: 70},
	outerWidth = 550,
	outerHeight = 550,
	innerWidth = outerWidth - margin.left - margin.right,
	innerHeight = outerHeight - margin.top - margin.bottom;

// SCALE RANGE
var x = d3.scale
	.linear()
	.range([0, innerWidth]);
var y = d3.scale
	.linear()
	.range([innerHeight, 0]);

// SVG
var svg = d3
	.select('body')
	.append('svg')
	.attr('width', outerWidth)
	.attr('height', outerHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// ??? group that will contain all of the plots
var groups = svg
	.append('g')
	.attr('transform', 'translate(0)');


// DATA
//d3.csv('A5-query.csv', function(error, data) {
d3.csv('spend30more.csv', function(error, data) {
	if (error) { throw error };

	// old
	data.forEach(function(d) {
		d.income = +d.income;
		d.fraction = +d.fraction;
	});

	// // new
	// data.forEach(function(d) {
	// 	// CONVERT DATA
	// 	d.name = d.name;
	// 	d.incomeGroup = d.incomeGroup;
	// 	d.houseType = d.houseType;
	// 	d.costIncomeRatio = d.costIncomeRatio;

	// 	// NUMBERS
	// 	d.tenureTotal = +d.tenureTotal;
	// 	d.tenureOwner = +d.tenureOwner;
	// 	d.tenureRenter = +d.tenureRenter;
	// 	d.tenureBand = +d.tenureBand;

	// 	// DERIVED
	// });

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.fraction; }));
   //x.domain(['Under $10k', '$10k to $19,999', '$20k to $29,999', '$30k to $39,999', '$40k to $49,999', '$50k to $59,999', '$60k to $69,999', '$70k to $79,999', '$80k to $89,999', '$90k to $99,999', '$100k and over'])
	y.domain([0, d3.max(data, function(d) { return d.tenure; })]);


	// PRINT IN CONSOLE ALL THE DATA
	// sort data alphabetically
	data.sort(function(a, b) { return d3.ascending(a.GEO_NAME, b.GEO_NAME); })
	console.log(data) 

	// Add the scatterplot
	var circles = groups
		.selectAll('dot')
		.data(data)
		.enter()
		.append('circle')
		.attr('r', 3) // how big the circles will be
		.attr('cx', function(d) { return x(+d.fraction); })
		.attr('cy', function(d) { return y(+d.tenure); })
		.attr('id', function(d) { return d.GEO_NAME;})
		.style('fill', function(d) { return 'red'; });
	
//INTERACTIONS
	// mouse over functionality
	var mouseOn = function() { 
		var circle = d3.select(this);
		//increase size/opacity of bubble
		circle
		.transition()
		.duration(800)
		.style('opacity', 1)
		.attr('r', 10)
		.ease('elastic');

		// function to move mouseover item to front of SVG stage, when another bubble overlaps it
		// this snippet was borrowed from http://bl.ocks.org/nsonnad/4481531
		d3.selection.prototype.moveToFront = function() { 
		  return this.each(function() { 
			this.parentNode.appendChild(this); 
		  }); 
		};
	};

	// mouse out functionality
	var mouseOff = function() {
		var circle = d3.select(this);

		// go back to original size and opacity
		circle.transition()
		.duration(800).style('opacity', 1)
		.attr('r',3).ease('elastic');

	};

	// CIRCLE INTERACTION
	circles.on('mouseover', mouseOn);
	circles.on('mouseout', mouseOff);


	// AXIS
	var xAxis = d3.svg
		.axis()
		.scale(x)
		.ticks(10) // set details on their ticks on x-axis
		.tickSubdivide(true)
		.tickSize(10, 10, 10)
		.orient('bottom');
	var yAxis = d3.svg
		.axis()
		.scale(y)
		.orient('left');

	// X-AXIS
	// appends 'g' element to the SVG. g is used to group SVG shapes together
	// can styling be applied via css with classes instead?
	svg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + innerHeight + ')')
		.attr('font-size','9px')
		.call(xAxis)  
			.append('text')
			.attr('class', 'label')
			.attr('x', innerWidth)
			.attr('font-size','12px')
			.attr('y', -8) //how far away the small text should be from the axis line
			.style('text-anchor', 'end')
			.style('font-weight', 'bold')
			.text('Fraction of people');
			//.text('How much is spent on housing ($)');

	// Y-AXIS
	svg
		.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.append('text')
			.attr('class', 'label')
			.attr('transform', 'rotate(-90)') //rotate text to y-axis to read
			.attr('y', 16) //how far away the small text should be from the axis line
			.style('text-anchor', 'end')
			.style('font-weight', 'bold')
			.text('Tenure');
			//.text('Fraction of the total population spending > 30% on housing');

});
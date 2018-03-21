var fileName = 'A5-query.csv';

// function getRow(d) {
// 	columnList = {name: d.name, incomeGroup: d.incomeGroup, houseType: d.houseType, costIncomeRatio: d.costIncomeRatio, tenureOwner: d.tenureOwner, tenureRenter: d.tenureRenter, tenureBand: d.tenureBand};

// 	return columnList;
// }

function getGroups(data) {
	var groups = {name: [], incomeGroup: [], houseType: [], costIncomeRatio: []};

	data.forEach(function(d) {
		if (groups.name.indexOf(d.name) == -1) { groups.name.push(d.name); }
		if (groups.incomeGroup.indexOf(d.incomeGroup) == -1) { groups.incomeGroup.push(d.incomeGroup); }
		if (groups.houseType.indexOf(d.houseType) == -1) { groups.houseType.push(d.houseType); }
		if (groups.costIncomeRatio.indexOf(d.costIncomeRatio) == -1) { groups.costIncomeRatio.push(d.costIncomeRatio); }
	});

	return groups;
}

function iG2Int(data, iG) {
	if (iG = 'Under $10,000') {
		return 0;
	} else if (iG = '$10,000 to $19,999') {
		return 1;
	} else if (iG = '$20,000 to $29,999') {
		return 2;
	} else if (iG = '$30,000 to $39,999') {
		return 3;
	} else if (iG = '$40,000 to $49,999') {
		return 4;
	} else if (iG = '$50,000 to $59,999') {
		return 5;
	} else if (iG = '$60,000 to $69,999') {
		return 6;
	} else if (iG = '$70,000 to $79,999') {
		return 7;
	} else if (iG = '$80,000 to $89,999') {
		return 8;
	} else if (iG = '$90,000 to $99,999') {
		return 9;
	} else if (iG = '$100,000 and over') {
		return 10;
	}	
}

function calcRatios(data, names, incomeGroups) {
	// INITIALIZE
	var selection = {};

	names.forEach(function(n) {
		selection[n] = {};
		incomeGroups.forEach(function(i) {
			selection[n][i] = {};
		});
	});

	// MATCH
	data.forEach(function(d) {
		names.forEach(function(n) {
			incomeGroups.forEach(function(i) {
				// if there is an entry in data with name in names and incomeGroup in incomeGroups
				if(!(d.name.indexOf(n) == -1 && d.incomeGroup.indexOf(i) == -1)) {
					// add to total count
					if (typeof selection[n][i]['total'] === 'undefined') {
						selection[n][i]['total'] = 0;
					}
					selection[n][i]['total'] += d.tenureOwner + d.tenureRenter + d.tenureBand;

					// if category is under30
					if (d.costIncomeRatio == 'Spending less than 30% of income on shelter costs') {
						// add to under30 count
						if (typeof selection[n][i]['under30'] === 'undefined') {
							selection[n][i]['under30'] = 0;
						}
						selection[n][i]['under30'] += d.tenureOwner + d.tenureRenter + d.tenureBand;
					}
				}
			});
		});
	});

	// CALCULATE RATIO
	Object.keys(selection).forEach(function(n) {
		Object.keys(selection[n]).forEach(function(i) {
			selection[n][i]['ratio'] = selection[n][i]['under30'] / selection[n][i]['total'];
		});
	});

	return selection;
}

function calcTotals(data, names, incomeGroups) {
	// INITIALIZE
	var matrix = {};

	getGroups(data)['houseType'].forEach(function(h) {
		matrix[h] = {tenureOwner: 0, tenureRenter: 0, tenureBand: 0};
	});

	// MATCH
	data.forEach(function(d) {
		names.forEach(function(n) {
			incomeGroups.forEach(function(i) {
				// if there is an entry in data with name in names and incomeGroup in incomeGroups
				if(!(d.name.indexOf(n) == -1 && d.incomeGroup.indexOf(i) == -1)) {
					// add to all tenure types
					matrix[d.houseType]['tenureOwner'] += d.tenureOwner;
					matrix[d.houseType]['tenureRenter'] += d.tenureRenter;
					matrix[d.houseType]['tenureBand'] += d.tenureBand;
				}
			});
		});
	});

	return matrix;
}

function dataRatios(ratios) {
	var ratios = [];
	Object.keys(ratios).forEach(function(n) {
		Object.keys(ratios[n]).forEach(function(i) {
			ratios.push({name: n, incomeGroup: i, ratio: ratios[n][i]['ratio']});
		});
	});
	return ratios;
}


// DIMENSIONS
var margin = {top: 30, right: 50, bottom: 50, left: 70},
	outerWidth = 550,
	outerHeight = 550,
	innerWidth = outerWidth - margin.left - margin.right,
	innerHeight = outerHeight - margin.top - margin.bottom;

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


// ALL
d3.csv(fileName, function(error, data) {
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

	var nameSelection = getGroups(data)['name'];
	var incomeSelection = getGroups(data)['incomeGroup'];

	var ratios = calcRatios(data, nameSelection, incomeSelection);
	var totals = calcTotals(data, nameSelection, incomeSelection);

	var ratioData = dataRatios(ratios);


	// SELECTION TO CONSOLE
	// Object.keys(ratios).forEach(function(n) {
	// 	Object.keys(ratios[n]).forEach(function(i) {
	// 		console.log(n + ', ' + i + ', ' + ratios[n][i]['under30'] + ', ' + ratios[n][i]['total'] + ', ' + ratios[n][i]['ratio']);
	// 	});
	// });

	// Object.keys(totals).forEach(function(h) {
	// 	console.log(h + ', ' + totals[h]['tenureOwner'] + ', ' + totals[h]['tenureRenter'] + ', ' + totals[h]['tenureBand']);
	// });

	// SCALE
	var x = d3.scale
		.linear()
    	.domain([0, 10])
    	.range([0, innerWidth]);

	var y = d3.scale
		.linear()
    	.domain([0, 1])
    	.range([innerHeight, 0]);

	// Add the scatterplot
	var circles = groups

		.enter()
		.append('circle')
		.attr('r', 3) // how big the circles will be
		.attr('cx',  x(iG2Int(5)))
		.attr('cy', y(0.5))
		.attr('id', 'name')
		.style('fill', 'red');

			// Add the scatterplot
	// var circles = groups
	// 	.append('circle')
	// 	.attr('r', 10) // how big the circles will be
	// 	.attr('cx', x(5))
	// 	.attr('cy', y(0.5))
	// 	.attr('id','name')
	// 	.style('fill', 'red');
	
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
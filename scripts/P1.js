function P1() {
    this.draw = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height) {
        var x = d3.scale.linear()
           .domain([0, stimuliWidth])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var line = d3.svg.line()
           .x(function (d) {
               return x(d.mappedfixationpointX);
           })
           .y(function (d) {
               return y(d.mappedfixationpointY);
           });

        graph.append("svg:path")
        .attr("d", function () { return line(fixationData); })
        .attr("stroke", "black")
    }

    this.drawDetailedVersion = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, margin) {
        this.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);

        var x = d3.scale.linear()
           .domain([0, stimuliWidth])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("top")
            .innerTickSize(height)
            .ticks(7);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .ticks(7);

        var lineWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })

        graph.append("g")         // Add the X Axis
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        graph.append("g")         // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);

        // Add the text label for the x axis
        graph.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + -(margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("X");

        // Add the text label for the Y axis
        graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("Y");

        //Add fixation dots and tooltips
        graph.selectAll("dot")
            .data(fixationData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", "2")
            .attr("cx", function (d) { return x(d.mappedfixationpointX); })
            .attr("cy", function (d) { return y(d.mappedfixationpointY); })
            .on("mouseover", function (d) { addTooltip(70, 20, "(" + d.mappedfixationpointX + "," + d.mappedfixationpointY + ")") })
            .on("mouseout", removeTooltip);

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');

    }
}
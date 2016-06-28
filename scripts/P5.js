function P5()
{
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

        var coordinates = new Array();
        for (var i = 0; i < fixationData.length - 1; i++) {
            coordinates[i] = {
                p: [{ mappedfixationpointX: fixationData[i].mappedfixationpointX, mappedfixationpointY: fixationData[i].mappedfixationpointY }, { mappedfixationpointX: fixationData[i + 1].mappedfixationpointX, mappedfixationpointY: fixationData[i + 1].mappedfixationpointY }],
                color: colorScale(fixationData[i].timestamp).toString()
            }
        }

        graph.selectAll('path')
       .data(coordinates)
       .enter().append('path')
       .attr('d', function (d) { return line(d.p); })
       .attr('stroke', function (d) { return d.color; });
    }

    this.drawDetailedVersion = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("P5", fixationData, null);
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

        // Add the color encoding label
        var text = graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.75 * margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")

        text.append("svg:tspan").attr("class", "text").text("Color encoding: ");
        text.append("svg:tspan").attr("class", "text-nocolor").style("fill", colorScale(d3.min(fixationData, function (d) { return d.timestamp; }))).text("start");
        text.append("svg:tspan").attr("class", "text").text(" - ");
        text.append("svg:tspan").attr("class", "text-nocolor").style("fill", colorScale(d3.max(fixationData, function (d) { return d.timestamp; }))).text("finish");

        //Add the color encoding sample
        var divisions = [];
        var divisionLength;
        if (fixationData.length <= 10) {
            divisionLength = 100 / (shortColorRange.length - 1);
            for (var i = 0; i < shortColorRange.length; i++) {
                divisions.push({ offset: divisionLength * i + "%", color: shortColorRange[i] });
            }
        }
        else {
            divisionLength = 100 / (longColorRange.length - 1);
            for (var i = 0; i < longColorRange.length; i++) {
                divisions.push({ offset: divisionLength * i + "%", color: longColorRange[i] });
            }
        }

        graph.append("linearGradient")
          .attr("id", "gradient")
          .attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0).attr("y1", 5)
          .attr("x2", width / 10).attr("y2", 5)
          .selectAll("stop")
          .data(divisions)
          .enter().append("stop")
          .attr("offset", function (d) { return d.offset; })
          .attr("stop-color", function (d) { return d.color; });

        graph
        .append('rect')
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", 10)
        .attr("width", width / 10)
        .attr('fill', "url(#gradient)")
        .style("stroke", "#929292")
        .attr("transform", "translate(" + 0.80 * width + " ," + (height + margin.bottom / 2) + ")");

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
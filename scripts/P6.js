function P6()
{
    this.draw = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, type) {
        var yAxis = document.getElementById("cmbYAxis").value;
        var x = d3.scale.linear()
           .domain([0, stimuliWidth])
           .range([0, width]);

        var y = d3.scale.linear()
           .domain([0, stimuliHeight])
           .range([0, height]);

        var lineWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })

        var lineCurveWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })
        .interpolate("basis");

        var arcYProportion = 0;
        if (type === "extended") {
            arcYProportion = 3;
        }
        else {
            arcYProportion = 6;
        }

        var middlepoints = new Array();
        var index = 0;
        for (var i = 0; i < fixationData.length - 1; i++) {

            var arcInitialCoordinate;
            var arcFinalCoordinate;

            if (yAxis === "x") {
                arcInitialCoordinate = x(fixationData[i].mappedfixationpointX);
                arcFinalCoordinate = x(fixationData[i + 1].mappedfixationpointX);
            } else {
                arcInitialCoordinate = y(fixationData[i].mappedfixationpointY);
                arcFinalCoordinate = y(fixationData[i + 1].mappedfixationpointY);
            }

            var axisHalf = height / 2;

            if (arcInitialCoordinate < arcFinalCoordinate) {//left to right - top of the axis
                middlepoints[i] = {
                    p: [{ mappedfixationpointX: arcInitialCoordinate, mappedfixationpointY: axisHalf },
                        { mappedfixationpointX: arcInitialCoordinate + Math.abs(arcInitialCoordinate - arcFinalCoordinate) / 6, mappedfixationpointY: axisHalf - Math.abs(arcInitialCoordinate - arcFinalCoordinate) / arcYProportion },
                        { mappedfixationpointX: arcInitialCoordinate + Math.abs(arcInitialCoordinate - arcFinalCoordinate) / 2, mappedfixationpointY: axisHalf - Math.abs(arcInitialCoordinate - arcFinalCoordinate) / (arcYProportion - arcYProportion / 4) },
                        { mappedfixationpointX: arcFinalCoordinate - Math.abs(arcInitialCoordinate - arcFinalCoordinate) / 6, mappedfixationpointY: axisHalf - Math.abs(arcInitialCoordinate - arcFinalCoordinate) / arcYProportion },
                        { mappedfixationpointX: arcFinalCoordinate, mappedfixationpointY: axisHalf }
                    ],
                    color: colorScale(fixationData[i].timestamp).toString()
                }
            }
            else {//right to left - down the axis
                middlepoints[i] = {
                    p: [{ mappedfixationpointX: arcFinalCoordinate, mappedfixationpointY: axisHalf },
                        { mappedfixationpointX: arcFinalCoordinate + (arcInitialCoordinate - arcFinalCoordinate) / 6, mappedfixationpointY: axisHalf + (arcInitialCoordinate - arcFinalCoordinate) / arcYProportion },
                        { mappedfixationpointX: arcFinalCoordinate + (arcInitialCoordinate - arcFinalCoordinate) / 2, mappedfixationpointY: axisHalf + (arcInitialCoordinate - arcFinalCoordinate) / (arcYProportion - arcYProportion / 4) },
                        { mappedfixationpointX: arcInitialCoordinate - (arcInitialCoordinate - arcFinalCoordinate) / 6, mappedfixationpointY: axisHalf + (arcInitialCoordinate - arcFinalCoordinate) / arcYProportion },
                        { mappedfixationpointX: arcInitialCoordinate, mappedfixationpointY: axisHalf }
                    ],
                    color: colorScale(fixationData[i].timestamp).toString()
                }
            }
        }

        graph.selectAll('path')
       .data(middlepoints)
       .enter().append('path')
       .attr('d', function (d) { return lineCurveWithoutScale(d.p); })
       .attr('stroke', function (d) { return d.color; });

        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: height / 2 }, { mappedfixationpointX: width, mappedfixationpointY: height / 2 }]))
        .attr('stroke', "black");
    }

    this.drawDetailedVersion = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("P6", fixationData, null);
        this.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height, "extended");

        var x = d3.scale.linear()
           .domain([0, stimuliWidth])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .innerTickSize(-height)
            .ticks(7);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(0);

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
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.5 * margin.bottom) + ")")
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
            .text("Saccade direction*");

        //Add fixation dots and tooltips
        graph.selectAll("dot")
            .data(fixationData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", "2")
            .attr("cx", function (d) { return x(d.mappedfixationpointX); })
            .attr("cy", function (d) { return height / 2; })
            .on("mouseover", function (d) { addTooltip(70, 20, "x: " + d.mappedfixationpointX) })
            .on("mouseout", removeTooltip);

        // Add the color encoding label
        var text = graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + -(margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")

        text.append("svg:tspan").attr("class", "text").text("Color encoding: ");
        text.append("svg:tspan").attr("class", "text-nocolor").style("fill", colorScale(d3.min(fixationData, function (d) { return d.timestamp; }))).text("start");
        text.append("svg:tspan").attr("class", "text").text(" - ");
        text.append("svg:tspan").attr("class", "text-nocolor").style("fill", colorScale(d3.max(fixationData, function (d) { return d.timestamp; }))).text("finish");

        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.75 * margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")
            .text("*Right-to-left saccades are on top of the axis, left-to-right saccades are below");

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
        .attr("transform", "translate(" + 0.80 * width + " ," + -0.8 * margin.top + ")");

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
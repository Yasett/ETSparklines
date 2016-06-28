function P2()
{
    this.draw = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height) {
        chooseGrayScale(fixationData);
        var rectangles = new Array();
        var x = d3.scale.linear()
           .domain([0, stimuliWidth])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var duration = this.calculateDuration(fixationData);
        var minDuration = duration[0];
        var maxDuration = duration[1];
        var durationMatrix = duration[2];

        for (var i = 0; i < fixationData.length; i++) {
            var xCell = Math.floor(x(fixationData[i].mappedfixationpointX) * 6 / width);
            var yCell = Math.floor(y(fixationData[i].mappedfixationpointY) * 6 / height);

            if (yCell > 0 && xCell > 0) {

                durationMatrix[xCell][yCell] = durationMatrix[xCell][yCell] + fixationData[i].fixationduration;

                if (durationMatrix[xCell][yCell] < minDuration) {
                    minDuration = durationMatrix[xCell][yCell];
                }

                if (durationMatrix[xCell][yCell] > maxDuration) {
                    maxDuration = durationMatrix[xCell][yCell];
                }
            }
        }

        var index = 0;
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 6; j++) {
                if (durationMatrix[i][j] > 0) {
                    rectangles[index] = { "x_axis": i * width / 6, "y_axis": j * height / 6, "height": height / 6, "width": width / 6, "color": durationMatrix[i][j] == 0 ? '#ffffff' : individualGrayScale(durationMatrix[i][j]), "duration": durationMatrix[i][j] };
                    index++;
                }
            }
        }

        var rects = graph.selectAll("rect")
        .data(rectangles)
        .enter()
        .append("rect")
        .attr("x", function (d) { return d.x_axis; })
        .attr("y", function (d) { return d.y_axis; })
        .attr("height", function (d) { return d.height; })
        .attr("width", function (d) { return d.width; })
        .style("fill", function (d) { return d.color; })
        .attr("duration", function (d) { return d.duration; });

        return rectangles;
    }

    this.drawDetailedVersion = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, margin) {
        this.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);
        var rects = graph.selectAll("rect")
            .on("mouseover", function (d) { addTooltip(70, 20, "duration: " + d3.select(this).attr("duration") + " milliseconds") })
            .on("mouseout", removeTooltip)

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
            .tickValues([1 * stimuliWidth / 6, 2 * stimuliWidth / 6, 3 * stimuliWidth / 6, 4 * stimuliWidth / 6, 5 * stimuliWidth / 6, 6 * stimuliWidth / 6]);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .ticks(6);

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

        graph.append("path")         // Add the X Axis
        .attr("x", "translate(0," + height + ")")
        .call(xAxis);

        graph.append("g")         // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);

        // Add the text label for the x axis
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top / 2) + ")")
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

        // Add the color encoding label
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.75 * margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("darkness = total duration of fixations in the cell area");

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }

    this.calculateDuration = function (fixationData) {
        var durationMatrix = new Array(6);
        var minDuration = Number.MAX_SAFE_INTEGER;
        var maxDuration = 0;

        for (var i = 0; i < durationMatrix.length; i++) {
            durationMatrix[i] = Array.apply(null, new Array(6)).map(function () { return 0; });
        }
        
        if (fixationData.length > 0) {
            var stimuliWidth = (stimuliSize[fixationData[0].stimuliname])[0];
            var stimuliHeight = (stimuliSize[fixationData[0].stimuliname])[1];

            var x = d3.scale.linear()
            .domain([0, stimuliWidth])
            .range([0, width]);

            var y = d3.scale.linear()
               .domain([0, stimuliHeight])
               .range([0, height]);

            for (var i = 0; i < fixationData.length; i++) {
                if (fixationData[i].selected === "yes") {
                    var xCell = Math.floor(fixationData[i].mappedfixationpointX * 6 / stimuliWidth);
                    var yCell = Math.floor(fixationData[i].mappedfixationpointY * 6 / stimuliHeight);
                    if (yCell > 0 && xCell > 0) {

                        durationMatrix[xCell][yCell] = durationMatrix[xCell][yCell] + fixationData[i].fixationduration;

                        if (durationMatrix[xCell][yCell] < minDuration) {
                            minDuration = durationMatrix[xCell][yCell];
                        }

                        if (durationMatrix[xCell][yCell] > maxDuration) {
                            maxDuration = durationMatrix[xCell][yCell];
                        }
                    }
                }
            }
        }

        return [minDuration, maxDuration, durationMatrix];
    }
}
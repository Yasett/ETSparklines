function P4()
{
    this.draw = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height) {
        var xCells = (Math.ceil(fixationData.length / 10) * 10);//Gets the upper multiple of 10 i.e. for n=14 it returns 20
        var yAxis = document.getElementById("cmbYAxis").value;
        var cellWidth = width / xCells;
        var cellHeight = height / 6;

        var totalTime = 0;

        for (var i = 0; i < fixationData.length; i++) {
            if (i < fixationData.length - 1) {
                totalTime += (fixationData[i + 1].timestamp - fixationData[i].timestamp);
            }
            else {
                totalTime += fixationData[i].fixationduration;
            }
        }

        var minTimestamp = d3.min(fixationData, function (d) { return d.timestamp; });

        var x = d3.scale.linear()
        .domain([minTimestamp, minTimestamp + totalTime])
        .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, yAxis == "x" ? stimuliWidth : stimuliHeight])
            .range([0, height]);

        var timeSpan = totalTime / xCells;
        var durationMatrix = new Array(xCells);
        var minDuration = Number.MAX_SAFE_INTEGER;
        var maxDuration = 0;

        for (var i = 0; i < durationMatrix.length; i++) {
            durationMatrix[i] = Array.apply(null, new Array(6)).map(function () { return 0; });
        }

        for (var i = 0; i < fixationData.length; i++) {
            var xCell = Math.floor((x(fixationData[i].timestamp) * xCells) / x(minTimestamp + totalTime));
            var yCell = Math.floor((y(yAxis == "x" ? fixationData[i].mappedfixationpointX : fixationData[i].mappedfixationpointY) * 6) / height);

            if (xCell == xCells) {
                xCell--;
            }

            var cellTimeLimit = minTimestamp + ((xCell + 1) * timeSpan);

            durationMatrix[xCell][yCell] = durationMatrix[xCell][yCell] + (cellTimeLimit - fixationData[i].timestamp);
            var remainingDuration = fixationData[i].fixationduration - (cellTimeLimit - fixationData[i].timestamp);

            if (durationMatrix[xCell][yCell] < minDuration) {
                minDuration = durationMatrix[xCell][yCell];
            }

            if (durationMatrix[xCell][yCell] > maxDuration) {
                maxDuration = durationMatrix[xCell][yCell];
            }

            var spanIndex = 1;

            while (remainingDuration > 0) {
                cellTimeLimit = minTimestamp + ((xCell + spanIndex + 1) * timeSpan);

                if (xCell + spanIndex == xCells) {
                    xCell--;
                }

                if (remainingDuration > timeSpan) {
                    durationMatrix[xCell + spanIndex][yCell] = durationMatrix[xCell + spanIndex][yCell] + timeSpan;
                }
                else {
                    durationMatrix[xCell + spanIndex][yCell] = durationMatrix[xCell + spanIndex][yCell] + remainingDuration;
                }

                remainingDuration = remainingDuration - timeSpan;

                if (durationMatrix[xCell + spanIndex][yCell] < minDuration) {
                    minDuration = durationMatrix[xCell + spanIndex][yCell];
                }

                if (durationMatrix[xCell + spanIndex][yCell] > maxDuration) {
                    maxDuration = durationMatrix[xCell + spanIndex][yCell];
                }

                spanIndex++;
            }
        }

        var cells = new Array();
        var lightGrayScale = d3.scale.linear()
        .domain([minDuration, maxDuration])
        .range(['#ececec', '#1e1e1e']);

        var index = 0;
        for (var i = 0; i < xCells; i++) {
            for (var j = 0; j < 6; j++) {
                if (durationMatrix[i][j] > 0) {
                    cells[index] = { "x_axis": i * x(minTimestamp + timeSpan), "y_axis": j * cellHeight, "height": cellHeight, "width": x(minTimestamp + timeSpan), "color": lightGrayScale(durationMatrix[i][j]), "duration": durationMatrix[i][j] };
                    index++;
                }
            }
        }

        graph.attr("startTime", minTimestamp);
        graph.attr("finishTime", minTimestamp + totalTime);

        graph.selectAll("rect")
        .data(cells)
        .enter()
        .append("rect")
        .attr("x", function (d) { return d.x_axis; })
        .attr("y", function (d) { return d.y_axis; })
        .attr("height", function (d) { return d.height; })
        .attr("width", function (d) { return d.width; })
        .style("fill", function (d) { return d.color; })
        .attr("duration", function (d) { return d.duration; });
    }

    this.drawDetailedVersion = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, margin) {
        var cmbYAxis = document.getElementById("cmbYAxis").value;
        this.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);

        graph.selectAll("rect")
            .on("mouseover", function (d) { addTooltip(70, 20, "duration: " + (+d3.select(this).attr("duration")).toFixed(2) + " milliseconds") })
            .on("mouseout", removeTooltip)

        //Display only 10 ticks in the X axis
        var xTicks = new Array(10);

        for (var i = 0; i <= 10; i++) {
            xTicks[i] = Math.ceil((graph.attr("finishTime") - graph.attr("startTime")) / 10 * i);
        }

        var x = d3.scale.linear()
           .domain([0, graph.attr("finishTime") - graph.attr("startTime")])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("top")
            .innerTickSize(height)
            .tickValues(xTicks);

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

        graph.append("g")         // Add the Y Axis
        .attr("class", "y axis")
        .call(yAxis);

        // Add the text label for the x axis
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("Time (milliseconds)");

        // Add the text label for the Y axis
        graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text(cmbYAxis == "x" ? "X" : "Y");

        //Calculate the time period length
        var xCells = (Math.ceil(fixationData.length / 10) * 10);//Gets the upper multiple of 10 i.e. for n=14 it returns 20
        var timePeriod = (graph.attr("finishTime") - graph.attr("startTime")) / xCells;

        // Add the color encoding label
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.75 * margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")
            .text("time period length = " + timePeriod.toFixed(2) + " milliseconds");

        // Add the time period label
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.5 * margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")
            .text("darkness = duration of fixations in the area during the time period");

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
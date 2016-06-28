function P3()
{
    this.calculateDuration = function (fixationData) {
        var duration = new Array(6);
        var minDuration = Number.MAX_SAFE_INTEGER;
        var maxDuration = 0;
        var yAxis = document.getElementById("cmbYAxis").value;

        if (fixationData.length > 0) {
            var stimuliWidth = (stimuliSize[fixationData[0].stimuliname])[0];
            var stimuliHeight = (stimuliSize[fixationData[0].stimuliname])[1];

            var x = d3.scale.linear()
               .domain([0, stimuliWidth])
               .range([0, width]);

            var y = d3.scale.linear()
               .domain([0, stimuliHeight])
               .range([0, height]);

            duration = Array.apply(null, new Array(6)).map(function () { return 0; });

            for (var i = 0; i < fixationData.length; i++) {
                if (fixationData[i].selected === "yes") {
                    var cell = yAxis == "x" ? Math.floor(fixationData[i].mappedfixationpointX * 6 / stimuliWidth) :
                                          Math.floor(fixationData[i].mappedfixationpointY * 6 / stimuliHeight);
                    if (cell == 6) {
                        cell--;
                    }

                    duration[cell] = duration[cell] + fixationData[i].fixationduration;

                    if (duration[cell] < minDuration) {
                        minDuration = duration[cell];
                    }

                    if (duration[cell] > maxDuration) {
                        maxDuration = duration[cell];
                    }
                }
            }
        }

        return [minDuration, maxDuration, duration];
    }

    this.draw = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height) {
        chooseGrayScale(fixationData);
        var yAxis = document.getElementById("cmbYAxis").value;
        var frequency = new Array(6);
        var rectangles = new Array(6);
        var duration = this.calculateDuration(fixationData);

        minDuration = duration[0];
        maxDuration = duration[1];
        duration = duration[2];

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
        frequency = Array.apply(null, new Array(6)).map(function () { return 0; });

        if (yAxis == "x") {
            for (var i = 0; i < fixationData.length; i++) {
                var xCell = Math.floor(x(fixationData[i].mappedfixationpointX) * 6 / width);
                if (xCell == 6) {
                    xCell--;
                }
                frequency[xCell] += 1;
            }

            var barHeightScale = d3.scale.linear()
            .domain([0, d3.max(frequency)])
            .range([0, height]);

            for (var i = 0; i < 6; i++) {
                rectangles[i] = { "x_axis": i * width / 6, "y_axis": height - barHeightScale(frequency[i]), "height": barHeightScale(frequency[i]), "width": width / 6, "color": individualGrayScale(duration[i]), "duration": duration[i], "frequency": frequency[i] };
            }
        }
        else {
            for (var i = 0; i < fixationData.length; i++) {
                var yCell = Math.floor(y(fixationData[i].mappedfixationpointY) * 6 / height);
                if (yCell == 6) {
                    yCell--;
                }
                frequency[yCell] += 1;
            }

            var barWidthScale = d3.scale.linear()
            .domain([0, d3.max(frequency)])
            .range([0, width]);

            for (var i = 0; i < 6; i++) {
                rectangles[i] = { "x_axis": 0, "y_axis": i * height / 6, "height": height / 6, "width": barWidthScale(frequency[i]), "color": individualGrayScale(duration[i]), "duration": duration[i], "frequency": frequency[i] };
            }
        }

        graph.selectAll("rect")
        .data(rectangles)
        .enter()
        .append("rect")
        .attr("x", function (d) { return d.x_axis; })
        .attr("y", function (d) { return d.y_axis; })
        .attr("height", function (d) { return d.height; })
        .attr("width", function (d) { return d.width; })
        .style("fill", function (d) { return d.color; })
        .attr("duration", function (d) { return d.duration; })
        .attr("frequency", function (d) { return d.frequency; });
    }

    this.drawDetailedVersion = function (graph, fixationData, stimuliWidth, stimuliHeight, width, height, margin) {
        var cmbYAxis = document.getElementById("cmbYAxis").value;
        this.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);

        var rects = graph.selectAll("rect")
            .on("mouseover", function (d) { addTooltip(70, 20, "duration: " + d3.select(this).attr("duration") + " milliseconds<br/>frequency: " + d3.select(this).attr("frequency") + " fixations") })
            .on("mouseout", removeTooltip)

        var maxFrequency = 0;
        graph.selectAll("rect").each(function (d, i) {
            var rect = d3.select(this);
            if (+rect.attr("frequency") > maxFrequency) {
                maxFrequency = rect.attr("frequency")
            }
        });

        var x;
        var y;
        var xAxis;
        var yAxis;
        var textXAxis;
        var textYAxis;
        var colorLabelYPosition;
        var xAxisLabelYPosition;

        var lineWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })

        if (cmbYAxis == "x") {
            x = d3.scale.linear().domain([0, stimuliWidth]).range([0, width]);
            y = d3.scale.linear().domain([maxFrequency, 0]).range([0, height]);

            xAxis = d3.svg.axis().scale(x).orient("bottom")
            .innerTickSize(-height)
            .tickValues([1 * stimuliWidth / 6, 2 * stimuliWidth / 6, 3 * stimuliWidth / 6, 4 * stimuliWidth / 6, 5 * stimuliWidth / 6, 6 * stimuliWidth / 6]);

            yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .ticks(6);

            textXAxis = "X";
            textYAxis = "Frequency";
            colorLabelYPosition = -margin.top / 2;
            xAxisLabelYPosition = height + 0.75 * margin.bottom;
        }
        else {
            x = d3.scale.linear().domain([0, maxFrequency]).range([0, width]);
            y = d3.scale.linear().domain([0, stimuliHeight]).range([0, height]);

            xAxis = d3.svg.axis()
            .scale(x)
            .orient("top")
            .innerTickSize(height)
            .ticks(10);

            yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
            .ticks(6);

            textXAxis = "Frequency";
            textYAxis = "Y";

            colorLabelYPosition = height + 0.75 * margin.bottom;
            xAxisLabelYPosition = -margin.top / 2;
        }

        // Add the X Axis
        graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        // Add the Y Axis
        graph.append("g")
        .attr("class", "y axis")
        .call(yAxis);

        // Add the text label for the x axis
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + xAxisLabelYPosition + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text(textXAxis);

        // Add the text label for the Y axis
        graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text(textYAxis);

        // Add the color encoding label
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + colorLabelYPosition + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("darkness = total duration of fixations in the bar area");

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
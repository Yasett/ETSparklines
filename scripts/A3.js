function A3(){

    this.draw = function (graph, fixationData, listAOIs, width, height) {
        var rectangles = new Array(fixationData.length);

        var y = d3.scale.linear()
            .domain([0, listAOIs.length])
            .range([0, height]);

        //Calcultate bar height and Y offset
        var barHeight = height / 3;
        var yOffsets = {};
        if (barHeight * listAOIs.length > height) {
            var totalDifference = (barHeight * listAOIs.length - height);
            var difference = totalDifference / (listAOIs.length - 1);

            for (var i = 0; i < listAOIs.length; i++) {
                yOffsets[listAOIs[i]] = barHeight * i - difference * i;
            }
        }
        else {
            for (var i = 0; i < listAOIs.length; i++) {
                yOffsets[listAOIs[i]] = barHeight * i;
            }
        }

        for (var i = 0; i < fixationData.length; i++) {
            rectangles[i] = { "x_axis": i * width / fixationData.length, "y_axis": yOffsets[fixationData[i].aois], "height": fixationData[i].aois === undefined ? 0 : barHeight, "width": width / fixationData.length, "color": fixationData[i].aois === undefined ? "#ffffff" : colorScale(listAOIs.indexOf(fixationData[i].aois)), "name": fixationData[i].aois, "duration": fixationData[i].fixationduration };
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
        .attr("name", function (d) { return d.name; })
        .attr("duration", function (d) { return d.duration; })
    }

    this.drawDetailedVersion = function (graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("A3", fixationData, listAOIs);
        this.draw(graph, fixationData, listAOIs, width, height);

        var x = d3.scale.linear()
           .domain([0, stimuliWidth])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(0);

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
            .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("AOIs sequence");

        //Add fixation tooltips
        graph.selectAll("rect")
            .on("mouseover", function (d) { addTooltip(70, 20, "AOI: " + d3.select(this).attr("name") + "<br/>Duration: " + d3.select(this).attr("duration") + " milliseconds") })
            .on("mouseout", removeTooltip)

        //Add AOI legends
        var divLegend = d3.select("#svgDetailedGraph")
            .append("g")
            .attr("transform", "translate(" + width / 2 + " ," + (height + margin.bottom) + ")")
            .attr("id", "groupLegend")
            .style("width", width / 3)
            .style("height", height / 3);

        drawLegend("#groupLegend", listAOIs, colorScale);

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
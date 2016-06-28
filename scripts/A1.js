function A1() {

    this.draw = function (graph, fixationData, listAOIs, width, height) {

        var rectangles = new Array(listAOIs.length);
        var maxFrequency = 0;

        var hash = {};

        for (var i = 0; i < fixationData.length; i++) {
            if (fixationData[i].aois != undefined) {
                if (hash[fixationData[i].aois] === undefined) {
                    hash[fixationData[i].aois] = 0;
                }

                hash[fixationData[i].aois] = hash[fixationData[i].aois] + 1;

                if (hash[fixationData[i].aois] > maxFrequency) {
                    maxFrequency = hash[fixationData[i].aois];
                }
            }
        }

        var x = d3.scale.linear()
        .domain([0, maxFrequency])
        .range([0, width]);

        for (var i = 0; i < listAOIs.length; i++) {
            rectangles[i] = { "x_axis": 0, "y_axis": i * height / listAOIs.length, "height": height / listAOIs.length, "width": hash[listAOIs[i]] === undefined ? 0 : x(hash[listAOIs[i]]), "color": colorScale(i), "name": listAOIs[i], "frequency": hash[listAOIs[i]] === undefined ? 0 : hash[listAOIs[i]] };
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
        .attr("frequency", function (d) { return d.frequency; });
    }

    this.drawDetailedVersion = function (graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("A1", fixationData, listAOIs);
        this.draw(graph, fixationData, listAOIs, width, height);

        var maxFrequency = 0;
        graph.selectAll("rect").each(function (d, i) {
            var rect = d3.select(this);
            if (+rect.attr("frequency") > maxFrequency) {
                maxFrequency = rect.attr("frequency")
            }
        });

        var x = d3.scale.linear()
           .domain([0, maxFrequency])
           .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, stimuliHeight])
            .range([0, height]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .innerTickSize(-height)
            .ticks(5);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .innerTickSize(-width)
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
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 0.75 * margin.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("Frequency");

        // Add the text label for the Y axis
        graph.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("AOIs");

        //Add fixation tooltips
        graph.selectAll("rect")
            .on("mouseover", function (d) { addTooltip(70, 20, "AOI: " + d3.select(this).attr("name") + "<br/>Frequency: " + d3.select(this).attr("frequency")) })
            .on("mouseout", removeTooltip)

        //Add AOI legends
        var divLegend = d3.select("#svgDetailedGraph")
            .append("g")
            .attr("transform", "translate(" + (width + margin.left + margin.right) + " ," + height / 2 + ")")
            .attr("id", "groupLegend")
            .style("width", width / 3)
            .style("height", height);

        drawLegend("#groupLegend", listAOIs, colorScale);

        //Add graph borders
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: 0 }, { mappedfixationpointX: width, mappedfixationpointY: height }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
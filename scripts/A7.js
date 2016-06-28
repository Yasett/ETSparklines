function A7() {

    this.draw = function (graph, fixationData, listAOIs, width, height, type) {
        chooseGrayScale(fixationData);
        var x = d3.scale.linear()
         .domain([0, width])
         .range([width / 6, width - (width / 6)]);

        var lineWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })

        var nodeRadius = 0;
        var pathWidth = 0;
        if (type === "extended") {
            pathWidth = 3.5;
            nodeRadius = 12;
        }
        else {
            pathWidth = 1;
            nodeRadius = height / 12;
        }
        var nodeDistance = width / (listAOIs.length - 1);

        var upperNodes = new Array(listAOIs.length);
        var lowerNodes = new Array(listAOIs.length);

        for (var i = 0; i < listAOIs.length; i++) {
            upperNodes[i] = { "x_axis": x(i * nodeDistance), "y_axis": 0 + nodeRadius, "radius": nodeRadius, "color": colorScale(i) };
            lowerNodes[i] = { "x_axis": x(i * nodeDistance), "y_axis": height - nodeRadius, "radius": nodeRadius, "color": colorScale(i) };
        }

        var transitions = new Array();
        var edges = {};
        var aoiSparkline = new AOISparkline();
        var weights = aoiSparkline.calculateWeight(fixationData, listAOIs);
        var maxFrequency = weights[0];
        weights = weights[1];

        for (var i = 0; i < listAOIs.length; i++) {
            for (var j = 0; j < listAOIs.length; j++) {
                if (i != j) {
                    edges[listAOIs[i] + listAOIs[j]] = { x1: upperNodes[i].x_axis, x2: lowerNodes[j].x_axis, y1: upperNodes[i].y_axis, y2: lowerNodes[j].y_axis };
                }
            }
        }

        var transitionIndex = 0;

        Object.keys(edges).forEach(function (key) {
            var edge = edges[key];
            if (weights[key] > 0) {

                transitions[transitionIndex] = {
                    p: [{ mappedfixationpointX: edge.x1, mappedfixationpointY: edge.y1 },
                        { mappedfixationpointX: edge.x2, mappedfixationpointY: edge.y2 }
                    ],
                    color: individualGrayScale(weights[key]).toString(),
                    weight: weights[key]
                }
                transitionIndex++;
            }
        })

        graph.selectAll('path')
       .data(transitions)
       .enter().append('path')
       .attr('d', function (d) { return lineWithoutScale(d.p); })
       .attr('stroke', function (d) { return d.color; })
       .style('stroke-width', pathWidth)
       .attr("weight", function (d) { return d.weight; })

        graph.selectAll("circle")
        .data(upperNodes.concat(lowerNodes))
        .enter()
        .append("circle")
        .attr("cx", function (d) { return d.x_axis; })
        .attr("cy", function (d) { return d.y_axis; })
        .attr("r", function (d) { return d.radius; })
        .style("fill", function (d) { return d.color; });
    }

    this.drawDetailedVersion = function (graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("A7", fixationData, listAOIs);
        this.draw(graph, fixationData, listAOIs, width, height, "extended");

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

        //Add the color encoding label
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("line darkness = frequence of the AOI transitions");

        //Add labels for the AOI's nodes
        var text = graph.append("text")
            .attr("transform", "translate(" + (-margin.left / 2) + " ," + (margin.top) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")

        text.append("svg:tspan").attr("class", "text-small").text("Source").attr("y", 0).attr("x", 0);
        text.append("svg:tspan").attr("class", "text-small").text("AOIs").attr("y", margin.top / 3).attr("x", 0);
        text.append("svg:tspan").attr("class", "text-small").text("Target").attr("y", height - margin.top * 2).attr("x", 0);
        text.append("svg:tspan").attr("class", "text-small").text("AOIs").attr("y", height - margin.bottom).attr("x", 0);

        //Add fixation tooltips
        graph.selectAll("path")
            .on("mouseover", function (d) { addTooltip(70, 20, "Weight: " + d3.select(this).attr("weight") + " transition(s)") })
            .on("mouseout", removeTooltip)

        //Add AOI legends
        var divLegend = d3.select("#svgDetailedGraph")
            .append("g")
            .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top * 2) + ")")
            .attr("id", "groupLegend")
            .style("width", width / 3)
            .style("height", height / 3);

        drawLegend("#groupLegend", listAOIs, colorScale);

        //Draw a rectangle that limits the graph area
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 },
                                     { mappedfixationpointX: width, mappedfixationpointY: 0 },
                                     { mappedfixationpointX: width, mappedfixationpointY: height },
                                     { mappedfixationpointX: 0, mappedfixationpointY: height },
                                     { mappedfixationpointX: 0, mappedfixationpointY: 0 }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');
    }
}
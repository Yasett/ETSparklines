function A6() {

    this.draw = function (graph, fixationData, listAOIs, width, height, type) {
        chooseGrayScale(fixationData);
        var x = d3.scale.linear()
        .domain([0, width])
        .range([width / 6, width - (width / 6)]);

        var lineCurveWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })
        .interpolate("basis");

        var arcYProportion = 0;
        var pathWidth = 0;
        var nodeRadius = 0;
        if (type === "extended") {
            arcYProportion = 3;
            pathWidth = 3.5;
            nodeRadius = 12;
        }
        else {
            arcYProportion = 6;
            pathWidth = 1;
            nodeRadius = height / 12;
        }
        var nodeDistance = width / (listAOIs.length - 1);

        var nodes = new Array(listAOIs.length);
        var transitions = new Array();
        var edges = {};
        var aoiSparkline = new AOISparkline();
        var weights = aoiSparkline.calculateWeight(fixationData, listAOIs);
        var maxFrequency = weights[0];
        weights = weights[1];

        for (var i = 0; i < listAOIs.length; i++) {
            nodes[i] = { "x_axis": x(i * nodeDistance), "y_axis": height / 2, "radius": nodeRadius, "color": colorScale(i) };
        }

        for (var i = 0; i < listAOIs.length; i++) {
            for (var j = 0; j < listAOIs.length; j++) {
                if (i != j) {
                    edges[listAOIs[i] + listAOIs[j]] = { x1: nodes[i].x_axis, x2: nodes[j].x_axis, y1: nodes[i].y_axis, y2: nodes[j].y_axis };
                }
            }
        }

        var transitionIndex = 0;

        Object.keys(edges).forEach(function (key) {
            var edge = edges[key];
            if (weights[key] > 0) {
                var axisHalf = height / 2;

                if (edge.x1 < edge.x2) {//x1 to x2 - top of the axis
                    transitions[transitionIndex] = {
                        p: [{ mappedfixationpointX: edge.x1, mappedfixationpointY: axisHalf },
                            { mappedfixationpointX: edge.x1 + Math.abs(edge.x1 - edge.x2) / 6, mappedfixationpointY: axisHalf - Math.abs(edge.x1 - edge.x2) / (arcYProportion + 1) },
                            { mappedfixationpointX: edge.x1 + Math.abs(edge.x1 - edge.x2) / 2, mappedfixationpointY: axisHalf - Math.abs(edge.x1 - edge.x2) / arcYProportion },
                            { mappedfixationpointX: edge.x2 - Math.abs(edge.x1 - edge.x2) / 6, mappedfixationpointY: axisHalf - Math.abs(edge.x1 - edge.x2) / (arcYProportion + 1) },
                            { mappedfixationpointX: edge.x2, mappedfixationpointY: axisHalf }
                        ],
                        color: individualGrayScale(weights[key]).toString(),
                        weight: weights[key]
                    }
                }
                else {//x2 to x1 - down the axis
                    transitions[transitionIndex] = {
                        p: [{ mappedfixationpointX: edge.x2, mappedfixationpointY: axisHalf },
                            { mappedfixationpointX: edge.x2 + Math.abs(edge.x1 - edge.x2) / 6, mappedfixationpointY: axisHalf + Math.abs(edge.x1 - edge.x2) / (arcYProportion + 1) },
                            { mappedfixationpointX: edge.x2 + Math.abs(edge.x1 - edge.x2) / 2, mappedfixationpointY: axisHalf + Math.abs(edge.x1 - edge.x2) / arcYProportion },
                            { mappedfixationpointX: edge.x1 - Math.abs(edge.x1 - edge.x2) / 6, mappedfixationpointY: axisHalf + Math.abs(edge.x1 - edge.x2) / (arcYProportion + 1) },
                            { mappedfixationpointX: edge.x1, mappedfixationpointY: axisHalf }
                        ],
                        color: individualGrayScale(weights[key]).toString(),
                        weight: weights[key]
                    }
                }
                transitionIndex++;
            }
        })

        graph.selectAll('path')
       .data(transitions)
       .enter().append('path')
       .attr('d', function (d) { return lineCurveWithoutScale(d.p); })
       .attr('stroke', function (d) { return d.color; })
       .style('stroke-width', pathWidth)
       .attr("weight", function (d) { return d.weight; })

        graph.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return d.x_axis; })
        .attr("cy", function (d) { return d.y_axis; })
        .attr("r", function (d) { return d.radius; })
        .style("fill", function (d) { return d.color; });
    }

    this.drawDetailedVersion = function (graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("A6", fixationData, listAOIs);
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

        //Add fixation tooltips
        graph.selectAll("path")
            .on("mouseover", function (d) { addTooltip(70, 20, "Weight: " + d3.select(this).attr("weight") + " transition(s)") })
            .on("mouseout", removeTooltip)

        //Draw graph border
        graph.append("svg:path")
        .attr("d", lineWithoutScale([{ mappedfixationpointX: 0, mappedfixationpointY: 0 },
                                     { mappedfixationpointX: width, mappedfixationpointY: 0 },
                                     { mappedfixationpointX: width, mappedfixationpointY: height },
                                     { mappedfixationpointX: 0, mappedfixationpointY: height },
                                     { mappedfixationpointX: 0, mappedfixationpointY: 0 }]))
        .style('stroke', "grey")
        .style('stroke-width', 1)
        .style('shape-rendering', 'crispEdges');

        // Add the color encoding label
        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("line darkness = frequence of the AOI transitions");

        // Add the arc position label
        graph.append("text")
            .attr("transform", "translate(" + width / 2 + " ," + (height + margin.bottom / 3) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text-small")
            .text("Right to left arcs are on top of the nodes, while left to right arcs are below");

        //Add AOI legends
        var divLegend = d3.select("#svgDetailedGraph")
            .append("g")
            .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top * 2) + ")")
            .attr("id", "groupLegend")
            .style("width", width / 3)
            .style("height", height / 3);

        drawLegend("#groupLegend", listAOIs, colorScale);
    }
}
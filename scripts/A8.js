function A8() {

    this.draw = function (graph, fixationData, listAOIs, width, height) {
        chooseGrayScale(fixationData);
        var sourceCells = new Array(listAOIs.length);
        var targetCells = new Array(listAOIs.length);
        var aoiWidth = width / (listAOIs.length + 1);
        var aoiHeight = height / (listAOIs.length + 1);

        var lineWithoutScale = d3.svg.line()
            .x(function (d) {
                return d.mappedfixationpointX;
            })
            .y(function (d) {
                return d.mappedfixationpointY;
            })

        for (var i = 0; i < listAOIs.length; i++) {
            targetCells[i] = { "x_axis": (i + 1) * aoiWidth, "y_axis": 0, "height": aoiHeight, "width": aoiWidth, "color": colorScale(i) };
            sourceCells[i] = { "x_axis": 0, "y_axis": (i + 1) * aoiHeight, "height": aoiHeight, "width": aoiWidth, "color": colorScale(i) };
        }

        var transitions = new Array();
        var aoiSparkline = new AOISparkline();
        var weights = aoiSparkline.calculateWeight(fixationData, listAOIs);
        var maxFrequency = weights[0];
        weights = weights[1];
        var edges = {};

        for (var i = 0; i < listAOIs.length; i++) {
            for (var j = 0; j < listAOIs.length; j++) {
                if (i != j) {
                    edges[listAOIs[i] + listAOIs[j]] = { x: targetCells[j].x_axis, y: sourceCells[i].y_axis };
                }
            }
        }

        var transitionIndex = 0;
        var lightGrayScale = d3.scale.linear()
        .domain([0, maxFrequency])
        .range(['#ececec', '#1e1e1e']);

        Object.keys(edges).forEach(function (key) {
            var edge = edges[key];
            if (weights[key] > 0) {

                transitions[transitionIndex] = {
                    "x_axis": edge.x,
                    "y_axis": edge.y,
                    "height": aoiHeight,
                    "width": aoiWidth,
                    "color": individualGrayScale(weights[key]).toString(),
                    "weight": weights[key],
                    "transition": "yes"
                };

                transitionIndex++;
            }
        })

        graph.selectAll("rect")
        .data(sourceCells.concat(targetCells).concat(transitions))
        .enter()
        .append("rect")
        .attr("x", function (d) { return d.x_axis; })
        .attr("y", function (d) { return d.y_axis; })
        .attr("height", function (d) { return d.height; })
        .attr("width", function (d) { return d.width; })
        .style("fill", function (d) { return d.color; })
        .attr("class", function (d) { return d.transition === "yes" ? "transition" : "" })
        .attr("weight", function (d) { return d.weight; });

        var separators = [{ p: [{ mappedfixationpointX: aoiWidth, mappedfixationpointY: 0 }, { mappedfixationpointX: aoiWidth, mappedfixationpointY: height }] },
                        { p: [{ mappedfixationpointX: 0, mappedfixationpointY: aoiHeight }, { mappedfixationpointX: width, mappedfixationpointY: aoiHeight }] }]

        graph.selectAll('path')
        .data(separators)
        .enter().append('path')
        .attr('d', function (d) { return lineWithoutScale(d.p); })
        .attr('stroke', "black");
    }

    this.drawDetailedVersion = function (graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, width, height, margin) {
        colorScale = defineColorScale("A8", fixationData, listAOIs);
        this.draw(graph, fixationData, listAOIs, width, height);

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

        // Add the color encoding label
        graph.append("text")
            .attr("transform", "translate(" + width / 2 + " ," + (height + margin.bottom / 3) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("cells darkness = frequence of the AOI transitions");

        //Add labels for the matrix
        var text = graph.append("text")
            .attr("transform", "translate(" + (-margin.left / 2) + " ," + (margin.top) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")

        text.append("svg:tspan").attr("class", "text").text("Source").attr("y", height / 2 - margin.top / 2).attr("x", 0);
        text.append("svg:tspan").attr("class", "text").text("AOIs").attr("y", height / 2).attr("x", 0);

        graph.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top / 2) + ")")
            .style("text-anchor", "middle")
            .attr("class", "text")
            .text("Target AOIs");

        //Add fixation tooltips
        graph.selectAll(".transition")
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
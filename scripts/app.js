$(document).ready(function (e) {
    try {
        $("body select").msDropDown();
    } catch (e) {
        alert("Drop down component: " + e.message);
    }
});
var width = document.getElementsByClassName("leftPane")[0].offsetWidth / 11;
var height = width/4;
var legendHeight = 100;
var legendWidth = width;
var resultsHashTable;
var aois;
var line;
var shortColorRange = ['#0000ff', '#6acd2f', '#ffff00', '#ff0000'];
var longColorRange = ['#0000ff', '#6acd2f', '#ffff00', '#ff0000', '#5400a8'];
var grayScaleRange = ['#c9c9c9', '#1e1e1e'];
var colorScale;
var globalGrayScale;
var stimuliGrayScale = {};
var individualGrayScale;
var lineWithoutScale;
var lineCurveWithoutScale;
var stimuli;
var sparklineDescriptions = {};
var stimuliSize = {};
var aoisCoordinates = {};
var file;
var p1;
var p2;
var p3;
var p4;
var p5;
var p6;
var a1;
var a2;
var a3;
var a4;
var a5;
var a6;
var a7;
var a8;
var aoiSparkline;

function init(fixationsFile, AOIsFile) {
    file = new fileHelper();
    file.loadFiles(fixationsFile, AOIsFile);

    p1 = new P1();
    p2 = new P2();
    p3 = new P3();
    p4 = new P4();
    p5 = new P5();
    p6 = new P6();
    a1 = new A1();
    a2 = new A2();
    a3 = new A3();
    a4 = new A4();
    a5 = new A5();
    a6 = new A6();
    a7 = new A7();
    a8 = new A8();
    aoiSparkline = new AOISparkline();

    d3.selectAll(".aGraph")
    .style("width", width + "px")
    .style("height", height + "px");

    d3.selectAll(".legend")
    .style("width", 0 + "px")
    .style("height", 0 + "px");

    sparklineDescriptions['P1'] = "The scan path visualization shows the trajectory of the gaze as a line.";
    sparklineDescriptions['P2'] = "It is a gridded attention map that aggregates fixation durations for spatial coordinates. It plots a coarsely gridded map and encodes the duration in the darkness of the grid cells.";
    sparklineDescriptions['P3'] = "It is a variant of the gridded attention map, where it focuses only in one axis, again encodes duration in the darkness of the bars, and the bar height encodes the frequency of the fixations in the respective area. ";
    sparklineDescriptions['P4'] = "It is a variant of the gridded attention map, where the X axis represents a time line and the Y axis could represent X or Y coordinates of the fixations. The darkness indicates the distribution of fixation durations.";
    sparklineDescriptions['P5'] = "It is a extension of the scan path, with temporal information represented by the edge colors. The first fixation is blue and folowing fixations have green, yellow, red and purple tones, in that order.";
    sparklineDescriptions['P6'] = "It is similar to saccade plots(i.e.jumps between fixations). The X coordinate of each fixation is connected sequentially by arcs. Arcs that are directed from left to right are on top of the axis, whereas arcs in the opposite direction are below.";
    sparklineDescriptions['A1'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline depicts the frequency that each AOI was fixated.";
    sparklineDescriptions['A2'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline shows the temporal sequence of viewed AOIs.";
    sparklineDescriptions['A3'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline shows the temporal sequence of viewed AOIs, assigning each AOI a position in the Y axis.";
    sparklineDescriptions['A4'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline shows the temporal sequence of viewed AOIs, where the darkness encodes the duration of each AOI fixation.";
    sparklineDescriptions['A5'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline shows the temporal sequence of viewed AOIs. In this case, the X axis is a linear timeline and the width of the boxes is defined according to the elapsed time.";
    sparklineDescriptions['A6'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline depicts transitions between AOIs, with AOIs as nodes, and aggregated transition frequencies as weighted links, where the darkness of each link encodes its frequency.";
    sparklineDescriptions['A7'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline depicts transitions between AOIs, with AOIs as nodes, and aggregated transition frequencies as weighted arcs, where the darkness of each arc encodes its frequency.";
    sparklineDescriptions['A8'] = "Areas of Interest (AOIs) abstract from the exact location of fixations to semantic regions on a stimulus. This sparkline depicts a matrix of transitions between AOIs, where the darkness of each box encodes the frequency of the transition.";

    configureOptions();

    d3.selectAll('.aGraph').on('click', showDetails);
}

function handleFileSelect(evt, dataType) {
    var readFile = evt.target.files[0];
    dataType === "fixation" ? document.getElementById("uploadFixationFile").value = readFile.name : document.getElementById("uploadAOIFile").value = readFile.name;
    
    file.handleFile(dataType, readFile);
}

function getStimuliSize() {
    var images = new Array(stimuli.length);
    for (var i = 0; i < stimuli.length; i++) {
        images[i] = new Image();
        images[i].src = "images/stimuli/" + stimuli[i];
        images[i].style.position = "absolute";
        images[i].style.left = -9999;             // Image width must not exceed 9999 pixels
        images[i].style.visibility = "hidden";
        images[i].stimuli = stimuli[i];
        document.body.appendChild(images[i]);
        images[i].onload = function () {
            var imgHeight = this.height;
            var imgWidth = this.width;
            stimuliSize[this.stimuli] = [imgWidth, imgHeight];
            document.body.removeChild(this);     // Removes the image from the DOM
        };

    }
}

function configureOptions() {
    var visualizationType = document.getElementById("visualizationType").value;
    document.getElementById("trFrequencyScale").style.display = "none";
    document.getElementById("trYAxis").style.display = "none";

    if (visualizationType !== "") {
        if (visualizationType == "P2" || visualizationType == "P3" || visualizationType == "A4" || visualizationType == "A6" || visualizationType == "A7" || visualizationType == "A8") {
            document.getElementById("trFrequencyScale").style.display = "inline";
        }

        if (visualizationType == "P3" || visualizationType == "P4" || visualizationType == "P6") {
            document.getElementById("trYAxis").style.display = "inline";
        }

        setSparklineDescription();
        show();
    }

    d3.selectAll(".aGraph_clicked").attr("class", "aGraph");
}

function setSparklineDescription() {
    var visualizationType = document.getElementById("visualizationType").value;
    var spDescription = document.getElementById("spDescription");
    if (spDescription.firstChild) {
        spDescription.removeChild(spDescription.firstChild);
    }
    spDescription.appendChild(document.createTextNode(sparklineDescriptions[visualizationType]));
}

function show() {
    if (resultsHashTable !== undefined) {
        var visualizationType = document.getElementById("visualizationType").value;
        var graphs = new Array();
        var colorScales = {};

        defineGrayScale();

        Object.keys(resultsHashTable).forEach(function (key) {
            var fixationData = new Array();
            var div = d3.select("#" + key);
            div.selectAll("svg").remove();
            var graph = d3.select("#" + key).append("svg:svg").attr("width", "100%").attr("height", "100%");

            for (var i = 0; i < resultsHashTable[key].length; i++) {
                if ((resultsHashTable[key])[i].selected == "yes") {
                    fixationData.push((resultsHashTable[key])[i]);
                }
            }

            if (fixationData.length > 0) {
                $("#" + key).data("stimulus", fixationData[0].stimuliname);
                var listAOIs = aois[fixationData[0].stimuliname];
                colorScales[fixationData[0].stimuliname] = defineColorScale(visualizationType, fixationData, listAOIs);
                chooseGrayScale(fixationData);

                draw(graph, fixationData, visualizationType, listAOIs, (stimuliSize[fixationData[0].stimuliname])[0], (stimuliSize[fixationData[0].stimuliname])[1]);
            }
        })

        for (var i = 0; i < stimuli.length; i++) {
            var stimuliName = stimuli[i].toString().substring(0, stimuli[i].indexOf("."));
            var legendDiv = d3.select("#l_" + stimuliName);
            legendDiv.selectAll("svg").remove();
        }

        if (visualizationType == "A1" || visualizationType == "A2" || visualizationType == "A3" || visualizationType == "A5" || visualizationType == "A6" || visualizationType == "A7" || visualizationType == "A8") {
            for (var i = 0; i < stimuli.length; i++) {
                var listAOIs = aois[stimuli[i]];
                var stimuliName = stimuli[i].toString().substring(0, stimuli[i].indexOf("."));
                drawLegend("#l_" + stimuliName, listAOIs, colorScales[stimuli[i]]);
                d3.selectAll(".legend")
                .style("width", legendWidth + "px")
                .style("height", legendHeight + "px");
            }
        }
        else {
            d3.selectAll(".legend")
            .style("width", 0 + "px")
            .style("height", 0 + "px");
        }
    }
    else {
        alert('Please load data file.');
    }
}

function filterData() {
    closePopup();
    var divCheckboxes = document.getElementById("divCheckboxes");
    var descendents = divCheckboxes.getElementsByTagName('input');
    for (var i = 0; i < descendents.length; i++) {
        var fixation = JSON.parse(descendents[i].value);
        var fixationGroup = resultsHashTable[fixation.participant + fixation.stimuli];

        var fixationIndex = binarySearch(fixation, fixationGroup)
        if (fixationIndex > -1) {
            (resultsHashTable[fixation.participant + fixation.stimuli])[fixationIndex].selected = descendents[i].checked ? "yes" : "no";
        }
    }
}

function binarySearch(searchElement, searchArray) {
    'use strict';

    var stop = searchArray.length;
    var last, currentIndex = 0,
        halfArraySize = 0;

    do {
        last = currentIndex;

        if (searchArray[currentIndex].timestamp > searchElement.timestamp) {
            stop = currentIndex + 1;
            currentIndex -= halfArraySize;
        } else if (searchArray[currentIndex].timestamp === searchElement.timestamp) {
            //value was found
            return currentIndex;
        }

        halfArraySize = Math.floor((stop - currentIndex) / 2);
        currentIndex += halfArraySize; //if delta = 0, p is not modified and loop exits

    } while (last !== currentIndex);

    return -1; //nothing found
}

function defineColorScale(visualizationType, fixationData, listAOIs) {
    if (visualizationType == "A1" || visualizationType == "A2" || visualizationType == "A3" || visualizationType == "A4" || visualizationType == "A5" || visualizationType == "A6" || visualizationType == "A7" || visualizationType == "A8") {
        //listAOIs.sort();

        if (listAOIs.length <= 10) {
            colorScale = d3.scale.linear()
            .domain([0,
                listAOIs.length / shortColorRange.length,
                listAOIs.length / shortColorRange.length * 2,
                listAOIs.length])
            .range(shortColorRange);
        }
        else {
            colorScale = d3.scale.linear()
            .domain([0,
                listAOIs.length / shortColorRange.length,
                listAOIs.length / shortColorRange.length * 2,
                listAOIs.length / shortColorRange.length * 3,
                listAOIs.length / shortColorRange.length * 4,
                listAOIs.length])
            .range(longColorRange);
        }

    } else {
        if (fixationData.length <= 10) {
            colorScale = d3.scale.linear()
            .domain([d3.min(fixationData, function (d) { return d.timestamp; }),
                fixationData[Math.floor(fixationData.length / shortColorRange.length)].timestamp,
                fixationData[Math.floor(fixationData.length / shortColorRange.length) * 2].timestamp,
                d3.max(fixationData, function (d) { return d.timestamp; })])
            .range(shortColorRange);
        }
        else {
            colorScale = d3.scale.linear()
            .domain([d3.min(fixationData, function (d) { return d.timestamp; }),
                fixationData[Math.floor(fixationData.length / longColorRange.length)].timestamp,
                fixationData[Math.floor(fixationData.length / longColorRange.length) * 2].timestamp,
                fixationData[Math.floor(fixationData.length / longColorRange.length) * 3].timestamp,
                d3.max(fixationData, function (d) { return d.timestamp; })])
            .range(longColorRange);
        }
    }

    return colorScale;
}

function defineGrayScale(fixationData) {
    var frequencyScale = document.getElementById("cmbFrequencyScale").value;
    var visualizationType = document.getElementById("visualizationType").value;

    if (frequencyScale == "global") {
        var minimumTotal = Number.MAX_SAFE_INTEGER;
        var maximumTotal = -1;

        Object.keys(resultsHashTable).forEach(function (key) {
            var fixationData = resultsHashTable[key];
            if (fixationData.length > 0) {

                var duration = calculateDuration(fixationData, visualizationType);
                var minimum = duration[0];
                var maximum = duration[1];

                if (minimum < minimumTotal) {
                    minimumTotal = minimum;
                }

                if (maximum > maximumTotal) {
                    maximumTotal = maximum;
                }
            }
        })

        globalGrayScale = d3.scale.linear()
        .domain([minimumTotal, maximumTotal])
        .range(grayScaleRange);

    } else if (frequencyScale == "stimulus") {
        var minimumPerStimulus = {};
        var maximumPerStimulus = {};

        Object.keys(resultsHashTable).forEach(function (key) {
            var fixationData = resultsHashTable[key];
            if (fixationData.length > 0) {
                var duration = calculateDuration(fixationData, visualizationType);
                var minimum = duration[0];
                var maximum = duration[1];

                if (minimumPerStimulus[fixationData[0].stimuliname] === undefined) {
                    minimumPerStimulus[fixationData[0].stimuliname] = minimum;
                }
                else if (minimum < minimumPerStimulus[fixationData[0].stimuliname]) {
                    minimumPerStimulus[fixationData[0].stimuliname] = minimum;
                }

                if (maximumPerStimulus[fixationData[0].stimuliname] === undefined) {
                    maximumPerStimulus[fixationData[0].stimuliname] = maximum;
                }
                else if (maximum > maximumPerStimulus[fixationData[0].stimuliname]) {
                    maximumPerStimulus[fixationData[0].stimuliname] = maximum;
                }
            }
        })

        Object.keys(minimumPerStimulus).forEach(function (key) {
            stimuliGrayScale[key] = d3.scale.linear()
            .domain([minimumPerStimulus[key], maximumPerStimulus[key]])
            .range(grayScaleRange);
        })

    } else if (frequencyScale == "individual") {
        if (fixationData !== undefined) {
            var duration = calculateDuration(fixationData, visualizationType);
            var minimum = duration[0];
            var maximum = duration[1];

            individualGrayScale = d3.scale.linear()
            .domain([minimum, maximum])
            .range(grayScaleRange);
        }
    }
}

function chooseGrayScale(fixationData) {
    var frequencyScale = document.getElementById("cmbFrequencyScale").value;
    switch (frequencyScale) {
        case "global":
            individualGrayScale = globalGrayScale;
            break;
        case "stimulus":
            individualGrayScale = stimuliGrayScale[fixationData[0].stimuliname];
            break;
        case "individual":
            defineGrayScale(fixationData);
            break;
    }
}
function calculateDuration(fixationData, visualizationType) {
    var domain;
    var minimum = Number.MAX_SAFE_INTEGER;
    var maximum = -1;
    if (visualizationType == "P2") {
        domain = p2.calculateDuration(fixationData);
        minimum = domain[0];
        maximum = domain[1];
    } else if (visualizationType == "P3") {
        domain = p3.calculateDuration(fixationData);
        minimum = domain[0];
        maximum = domain[1];
    } else if (visualizationType == "A4") {
        domain = a4.calculateDuration(fixationData);
        minimum = domain[0];
        maximum = domain[1];
    } else if (visualizationType == "A6") {
        domain = aoiSparkline.calculateWeight(fixationData, aois[fixationData[0].stimuliname]);
        minimum = 0;
        maximum = domain[0];
    } else if (visualizationType == "A7") {
        domain = aoiSparkline.calculateWeight(fixationData, aois[fixationData[0].stimuliname]);
        minimum = 0;
        maximum = domain[0];
    } else if (visualizationType == "A8") {
        domain = aoiSparkline.calculateWeight(fixationData, aois[fixationData[0].stimuliname]);
        minimum = 0;
        maximum = domain[0];
    }
    return [minimum, maximum]
}

function drawLegend(divName, listAOIs, colorScale) {

    var legendSvg = d3.select(divName).append("svg:svg").attr("width", "100%").attr("height", "100%");
    var legendColorSimbols = new Array(listAOIs.length);


    for (var i = 0; i < listAOIs.length; i++) {
        legendColorSimbols[i] = { "x_axis": 2, "y_axis": i * legendHeight / listAOIs.length, "height": legendHeight / listAOIs.length - 5, "width": 10, "color": colorScale(i) };
    }

    legendSvg.selectAll("rect")
    .data(legendColorSimbols)
    .enter()
    .append("rect")
    .attr("x", function (d) { return d.x_axis; })
    .attr("y", function (d) { return d.y_axis; })
    .attr("height", function (d) { return d.height; })
    .attr("width", function (d) { return d.width; })
    .style("fill", function (d) { return d.color; });

    legendSvg.selectAll("text")
    .data(legendColorSimbols)
    .enter()
    .append("text")
    .attr("x", function (d) { return d.x_axis + 12; })
    .attr("y", function (d) { return d.y_axis + d.height; })
    .text(function (d, i) { return listAOIs[i]; })
    .attr("font-family", "Tahoma")
    .attr("font-size", "9.5px")
    .attr("fill", "black");
}

function findNextAOIFixation(fixationData, initialIndex, aoi) {
    var nextIndex = -1;
    while (initialIndex < fixationData.length) {
        if (fixationData[initialIndex].aois !== undefined) {
            nextIndex = initialIndex;
            break;
        }
        else {
            initialIndex++;
        }
    }

    return nextIndex;
}

function draw(graph, fixationData, visualizationType, listAOIs, stimuliWidth, stimuliHeight) {

    switch (visualizationType) {
        case "P1":
            p1.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);
            break;
        case "P2":
            p2.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);
            break;
        case "P3":
            p3.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);
            break;
        case "P4":
            p4.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);
            break;
        case "P5":
            p5.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height);
            break;
        case "P6":
            p6.draw(graph, fixationData, stimuliWidth, stimuliHeight, width, height, "normal");
            break;
        case "A1":
            a1.draw(graph, fixationData, listAOIs, width, height);
            break;
        case "A2":
            a2.draw(graph, fixationData, listAOIs, width, height);
            break;
        case "A3":
            a3.draw(graph, fixationData, listAOIs, width, height);
            break;
        case "A4":
            a4.draw(graph, fixationData, listAOIs, width, height);
            break;
        case "A5":
            a5.draw(graph, fixationData, listAOIs, width, height);
            break;
        case "A6":
            a6.draw(graph, fixationData, listAOIs, width, height, "normal");
            break;
        case "A7":
            a7.draw(graph, fixationData, listAOIs, width, height, "normal");
            break;
        case "A8":
            a8.draw(graph, fixationData, listAOIs, width, height);
            break;
        default:
            break;

    }
}

function showDetails() {
    d3.selectAll(".aGraph_clicked").attr("class", "aGraph");
    d3.select("#"+this.id).attr("class", "aGraph_clicked");
    $graphDiv = $(this.id);

    var stimulusFileName = $("#" + this.id).data("stimulus");

    var divStimulusImage = document.getElementById("divStimulusImage");
    var stimuliWidth = (stimuliSize[stimulusFileName])[0];
    var stimuliHeight = (stimuliSize[stimulusFileName])[1];

    var divScale = 0;
    var divHeight = 0;
    var divWidth = 0;

    if (stimuliWidth > stimuliHeight) {
        divScale = (divStimulusImage.offsetWidth * 100) / stimuliWidth;
        divHeight = (stimuliHeight * divScale) / 100;
        divWidth = divStimulusImage.offsetWidth;
    }
    else {
        divHeight = divStimulusImage.offsetWidth;

        divScale = (divStimulusImage.offsetWidth * 100) / stimuliHeight;
        divWidth = (stimuliWidth * divScale) / 100;
    }

    (d3.select("#divStimulusImage")).selectAll("svg").remove();

    document.getElementById("btnReset").style.visibility = "visible";
    document.getElementById("sldZoom").style.visibility = "visible";
    $("#sldZoom").slider('value', 1000);
            
    var zoom = d3.behavior.zoom()
    .center([divWidth / 2, divHeight / 2])
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

    var visualizationType = document.getElementById("visualizationType").value;
    var map = d3.select("#divStimulusImage")
    .append("svg:svg")
    .attr("width", divWidth)
    .attr("height", divHeight)
    .append("g")
    .call(zoom);

    var container = map.append("g");

    zoom.on("zoom", function () { zoomed(container); })

    d3.select("#btnReset").on("click", function () {
        $("#sldZoom").slider('value', 1000);
        container.attr("transform", "translate(0,0) ");
        zoom.scale(1);
        zoom.translate([0, 0]);
        map.transition().duration(100).attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')')
    })

    d3.select("#divStimulusImage").style("height", divHeight + "px")

    container.append("image")
        .attr("id", "imgStimulus")
        .attr("width", divWidth)
        .attr("height", divHeight)
        .attr("x", 0 + "px")
        .attr("y", 0 + "px")
        .attr("xlink:href", "images/stimuli/" + stimulusFileName)
        .style("display", "block")
        .style("margin", "auto")
        .style("clear", "both");

    //draw AOIs
    if (visualizationType == "A1" || visualizationType == "A2" || visualizationType == "A3" || visualizationType == "A4" || visualizationType == "A5" || visualizationType == "A6" || visualizationType == "A7" || visualizationType == "A8") {
        var aoiCoordinates = aoisCoordinates[stimulusFileName];
        var colorScale = defineColorScale(visualizationType, null, aoiCoordinates);

        var x = d3.scale.linear()
        .domain([0, stimuliWidth])
        .range([0, divWidth]);

        var y = d3.scale.linear()
           .domain([0, stimuliHeight])
           .range([0, divHeight]);

        var rectangles = new Array(aoiCoordinates.length);
        for (var i = 0; i < aoiCoordinates.length; i++) {
            rectangles[i] = {
                "x_axis": x(aoiCoordinates[i].x1),
                "y_axis": y(aoiCoordinates[i].y1),
                "height": y(aoiCoordinates[i].height),
                "width": x(aoiCoordinates[i].width),
                "color": colorScale(i)
            };
        }

        container.selectAll("rect")
        .data(rectangles)
        .enter()
        .append("rect")
        .attr("x", function (d) { return d.x_axis; })
        .attr("y", function (d) { return d.y_axis; })
        .attr("height", function (d) { return d.height; })
        .attr("width", function (d) { return d.width; })
        .style("fill", function (d) { return d.color; })
        .style("fill-opacity", "0.4");
    }

    var fixationData = resultsHashTable[this.id];

    //Show stimulus and participant names
    var spStimulusTitle = document.getElementById("spStimulusTitle");
    if (spStimulusTitle.firstChild) {
        spStimulusTitle.removeChild(spStimulusTitle.firstChild);
    }
    spStimulusTitle.appendChild(document.createTextNode(d3.select("#" + this.id).attr("stimuliname")));
    spStimulusTitle.style.visibility = "visible";

    var spDetailedVersionTitle = document.getElementById("spDetailedVersionTitle")
    if (spDetailedVersionTitle.firstChild) {
        spDetailedVersionTitle.removeChild(spDetailedVersionTitle.firstChild);
    }
    spDetailedVersionTitle.appendChild(document.createTextNode("Participant: " + fixationData[0].user + ", Stimulus: "+d3.select("#" + this.id).attr("stimuliname")));
    spDetailedVersionTitle.style.visibility = "visible";

    //draw detailed version
    var margin = { top: 30, right: 40, bottom: 50, left: 50 };
    (d3.select("#divDetailedGraph")).selectAll("svg").remove();
    var divDetailedGraph = document.getElementById("divDetailedGraph");
    d3.select("#divDetailedGraph").style("height", (divHeight + margin.top + margin.bottom) + "px")
    d3.select("#divDetailedGraph").style("width", (divWidth + margin.left + margin.right) + "px")

    var graph = d3.select("#divDetailedGraph")
        .append("svg:svg")
        .attr("id", "svgDetailedGraph")
        .attr("width", divWidth + margin.left + margin.right)
        .attr("height", divHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var listAOIs = aois[stimulusFileName];

    switch (visualizationType) {
        case "P1":
            p1.drawDetailedVersion(graph, fixationData, stimuliWidth, stimuliHeight, divWidth, divHeight, margin);
            break;
        case "P2":
            p2.drawDetailedVersion(graph, fixationData, stimuliWidth, stimuliHeight, divWidth, divHeight, margin);
            break;
        case "P3":
            p3.drawDetailedVersion(graph, fixationData, stimuliWidth, stimuliHeight, divWidth, divHeight, margin);
            break;
        case "P4":
            p4.drawDetailedVersion(graph, fixationData, stimuliWidth, stimuliHeight, divWidth, divHeight, margin);
            break;
        case "P5":
            p5.drawDetailedVersion(graph, fixationData, stimuliWidth, stimuliHeight, divWidth, divHeight, margin);
            break;
        case "P6":
            p6.drawDetailedVersion(graph, fixationData, stimuliWidth, stimuliHeight, divWidth, divHeight, margin);
            break;
        case "A1":
            a1.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, (2 * divWidth) / 3, divHeight, margin);
            break;
        case "A2":
            a2.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth, (2 * divHeight) / 3, margin);
            break;
        case "A3":
            a3.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth, (2 * divHeight) / 3, margin);
            break;
        case "A4":
            a4.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth - margin.left, (2 * divHeight) / 3, margin);
            break;
        case "A5":
            a5.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth, (2 * divHeight) / 3, margin);
            break;
        case "A6":
            a6.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth, (2 * divHeight) / 3, margin);
            break;
        case "A7":
            a7.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth, (2 * divHeight) / 3, margin);
            break;
        case "A8":
            a8.drawDetailedVersion(graph, fixationData, listAOIs, stimuliWidth, stimuliHeight, divWidth, (2 * divHeight) / 3, margin);
        default:
            break;

    }
}

function addTooltip(width, height, text) {
    var div = d3.select("body").append("div")
    .attr("id", "divTooltip")
    .style("width", width)
    .style("height", height)
    .attr("class", "tooltip")

    div.transition()
        .duration(50)
        .style("opacity", .8);

    div.html(text)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - height) + "px");
}

function removeTooltip() {
    d3.select("body").selectAll("#divTooltip").remove();
}

function zoomed(container) {
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function zoomWithSlider(scale) {
    var svg = d3.select("#divStimulusImage").select("svg");
    var container = svg.select("g");
    var h = svg.attr("height"), w = svg.attr("width");

    // Note: works only on the <g> element and not on the <svg> element
    // which is a common mistake
    container.attr("transform",
            "translate(" + w / 2 + ", " + h / 2 + ") " +
            "scale(" + scale + ") " +
            "translate(" + (-w / 2) + ", " + (-h / 2) + ")");
}

$(function () {
    $("#sldZoom").slider({
        orientation: "horizontal",
        range: "min",
        min: 1000,
        max: 10000,
        value: 1000,
        slide: function (event, ui) {
            zoomWithSlider(ui.value / 1000);
        }
    });
});

function showModalPopUp_transparentBackground() {
    $("#divAdvancedSettings").css('visibility', 'visible');
    $("#transparentBackground").show();
    $("#divAdvancedSettings").show();
}

function closePopup() {
    $("#semiTransparentBackground").hide();
    $("#transparentBackground").hide();
    $("#divAdvancedSettings").hide();
}

function fileHelper()
{
    this.loadFiles = function (fixationsFile, AOIsFile) {
        var xmlhttp;
        var jsonObject;


        // code for IE7+, Firefox, Chrome, Opera, Safari
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        }
            // code for IE6, IE5
        else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var file = new File([xmlhttp.responseText], "filename");

                Papa.parse(file, {
                    header: true,
                    dynamicTyping: true,
                    complete: function (results) {
                        data = results;

                        var dataResults = data.data;
                        processData(dataResults);
                    }
                });
            }
        }
        xmlhttp.open("GET", fixationsFile, true);
        xmlhttp.send();

        var psv = d3.dsv(";", "text/plain");
        psv(AOIsFile, function (data) {
            processAOIsData(data);
        });

    }

    this.handleFile = function (dataType, readFile) {
        Papa.parse(readFile, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                data = results;

                var dataResults = data.data;
                dataType === "fixation" ? processData(dataResults) : processAOIsData(dataResults);
                show();
            }
        });
    }

    function processData(dataResults) {
        var divCheckboxes = document.getElementById("divCheckboxes");
        divCheckboxes.innerHTML = "";

        var participants = new Array();
        aois = {};
        resultsHashTable = {};
        stimuli = new Array();

        for (var i = 0; i < dataResults.length; i++) {
            if (dataResults[i].StimuliName !== undefined) {
                var stimuliName = dataResults[i].StimuliName.toString().substring(0, dataResults[i].StimuliName.indexOf("."));
                if (resultsHashTable[dataResults[i].user + stimuliName] === undefined) {
                    resultsHashTable[dataResults[i].user + stimuliName] = new Array();
                }
                resultsHashTable[dataResults[i].user + stimuliName].push({ timestamp: dataResults[i].Timestamp, stimuliname: dataResults[i].StimuliName, user: dataResults[i].user, mappedfixationpointX: dataResults[i].MappedFixationPointX, mappedfixationpointY: dataResults[i].MappedFixationPointY, fixationduration: dataResults[i].FixationDuration, aois: dataResults[i].aois, selected: "yes" });

                if (aois[dataResults[i].StimuliName] === undefined) {
                    aois[dataResults[i].StimuliName] = new Array();
                }

                if (aois[dataResults[i].StimuliName].indexOf(dataResults[i].aois) == -1 && dataResults[i].aois != undefined) {
                    aois[dataResults[i].StimuliName].push(dataResults[i].aois);
                }

                if (stimuli.indexOf(dataResults[i].StimuliName) == -1) {
                    stimuli.push(dataResults[i].StimuliName);
                }

                if (participants.indexOf(dataResults[i].user) == -1) {
                    participants.push(dataResults[i].user);
                }

                //Add chechbox for filtering
                var checkBox = document.createElement("input");
                var label = document.createElement("label");
                checkBox.type = "checkbox";
                checkBox.checked = "true";
                checkBox.name = "checkbox"
                checkBox.value = '{"timestamp": ' + dataResults[i].Timestamp + ', "stimulus": "' + stimuliName + '", "participant":"' + dataResults[i].user + '","fixationduration":' + dataResults[i].FixationDuration + ',"x":' + dataResults[i].MappedFixationPointX + ',"y":' + dataResults[i].MappedFixationPointX + ',"aoi":"' + dataResults[i].aois + '"}';
                divCheckboxes.appendChild(checkBox);
                divCheckboxes.appendChild(label);
                divCheckboxes.appendChild(document.createElement("br"));
                label.appendChild(document.createTextNode('timestamp: ' + dataResults[i].Timestamp + ',stimuli:' + stimuliName + ',participant:' + dataResults[i].user + ',fixation duration:' + dataResults[i].FixationDuration + ',x:' + dataResults[i].MappedFixationPointX + ',y:' + dataResults[i].MappedFixationPointX + ',aoi:' + dataResults[i].aois));
            }
        }

        for (var i = 0; i < stimuli.length; i++) {
            aois[stimuli[i]] = sortAOIs(aois[stimuli[i]]);
        }

        getStimuliSize();

        alert('Dataset is loaded on memory.');
    }

    function processAOIsData(aoisData) {
        aoisCoordinates = {};
        for (var i = 0; i < aoisData.length; i++) {
            var aois = aoisData[i].aois.split(" ");
            aois = sortAOIs(aois);
            aoisCoordinates[aoisData[i].stimulus] = new Array();

            if (aois.length > 0) {
                for (var j = 0; j < aois.length; j++) {
                    if (aois[j] !== "") {
                        var aoiCoordinates = aois[j].split(",");
                        aoisCoordinates[aoisData[i].stimulus].push({
                            aoi: aoiCoordinates[0],
                            x1: aoiCoordinates[1],
                            y1: aoiCoordinates[2],
                            width: aoiCoordinates[3],
                            height: aoiCoordinates[4]
                        });
                    }
                }
            }
        }

        //alert("AOI data is loaded.");
    }

    function sortAOIs(aois) {
        aois.sort();
        var orderedAOIs = new Array(aois);
        var destinationIndex = findIndex(aois, "Destination");
        var originIndex = findIndex(aois, "Origin");

        var index = 0;

        if (originIndex > -1) {
            orderedAOIs[index] = aois[originIndex];
            index++;
        }

        if (destinationIndex > -1) {
            orderedAOIs[index] = aois[destinationIndex];
            index++;
        }

        for (var i = 0; i < aois.length; i++) {
            if (i == destinationIndex || i == originIndex) continue;

            orderedAOIs[index] = aois[i];
            index++;
        }

        return orderedAOIs;
    }

    function findIndex(array, textoToFind) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].substring(0, textoToFind.length) === textoToFind) {
                return i;
                break;
            }
        }
    }
}




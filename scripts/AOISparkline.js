function AOISparkline() {

    this.calculateWeight = function (fixationData, listAOIs) {
        var x = d3.scale.linear()
            .domain([0, width])
            .range([width / 6, width - (width / 6)]);

        var weights = {};

        for (var i = 0; i < listAOIs.length; i++) {
            for (var j = 0; j < listAOIs.length; j++) {
                if (i != j) {
                    weights[listAOIs[i] + listAOIs[j]] = 0;
                }
            }
        }

        var maxFrequency = 0;

        var fixationIndex = 0;
        while (fixationIndex < fixationData.length - 2) {
            if (fixationData[fixationIndex].aois !== undefined) {
                var nextIndex = findNextAOIFixation(fixationData, fixationIndex + 1, fixationData[fixationIndex].aois);
                if (nextIndex > -1) {
                    if (fixationData[fixationIndex].aois != fixationData[nextIndex].aois) {
                        weights[fixationData[fixationIndex].aois + fixationData[nextIndex].aois] += 1;
                        if (weights[fixationData[fixationIndex].aois + fixationData[nextIndex].aois] > maxFrequency) {
                            maxFrequency = weights[fixationData[fixationIndex].aois + fixationData[nextIndex].aois];
                        }
                        fixationIndex = nextIndex;
                    }
                    else {
                        fixationIndex++;
                    }
                }
                else {
                    break;//no more transitions, end of loop
                }
            }
            else {
                fixationIndex++;
            }
        }

        return [maxFrequency, weights];
    }
}
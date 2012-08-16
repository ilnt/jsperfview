(function(exports) {
/**
 * Renders a graph for a given test in browserscope
 *
 */

/**
 * @param {string} id The browserscope ID of the test
 */
function Chart(testId) {
  this.testId = testId;
  this.chart = null;
}

Chart.URL_FORMAT = 'http://www.browserscope.org/user/tests/table/{ID}?v=3&o=json&callback=?';
Chart.MODERN = /Firefox ([4-9]|[1-2][0-9])|Chrome [1-2][0-9]|IE 9|IE 1[0-9]|Safari ([5-9]|1[0-9])/;
Chart.MOBILE = /iPhone|iPad|Android/

/**
 * Renders a graph for the corresponding test
 * @param {string} id ID of the element to render the graph in
 */
Chart.prototype.render = function(id) {
  var url = Chart.URL_FORMAT.replace('{ID}', this.testId);
  var that = this;
  $.getJSON(url, function(data) {
    var chartInfo = parseChart_(data);
    that.chart = renderChart_(chartInfo, id, 'column');
  });
};

/**
 * Shows only series that match the regex
 * @param {object} regex Regular expression that slices in twain
 */
Chart.prototype.filter = function(regex) {
  for (var i = 0; i < this.chart.series.length; i++) {
    var s = this.chart.series[i];
    if (s.name.match(regex)) {
      s.show();
    } else {
      s.hide();
    }
  }
}

function parseChart_(response) {
  var didComputeTestNames = false;
  var testNames = [];
  var platforms = [];
  var series = [];
  for (var platform in response.results) {
    platforms.push(platform);
    var data = [];
    var platformResults = response.results[platform].results;
    for (var testName in platformResults) {
      // If we haven't computed all testNames yet, compute them
      if (!didComputeTestNames) {
        testNames.push(testName);
      }
      // Compute series data
      var result = parseInt(platformResults[testName].result, 10);
      if (typeof result === 'number' && !isNaN(result)) {
        data.push(result);
      }
    }
    didComputeTestNames = true;
    // Add platform to the series only if there's data
    if (data.length) {
      series.push({
        name: platform,
        data: data
      });
    }
  }
  return {
    title: {
      text: response.category_name
    },
    xAxis: {
      categories: testNames
    },
    series: series
  }
}

function renderChart_(chartInfo, id, type) {
  chartInfo.chart = {
    renderTo: id,
    type: type,
    height: 300
  };
  chartInfo.yAxis = {
    title: {
      text: "Iterations/s"
    }
  };
  var chart = new Highcharts.Chart(chartInfo);
  return chart;
}

exports.Chart = Chart;
})(window);

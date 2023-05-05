let waterwaysData = [];
let waterwaysMeasures = [];
let measureList = [];
let filteredDataView1 = [];
let year = 2007;
let contaminantValue = "Ammonium";
let opacity = 0;
var csv = [];
let selectedLocation;
let colorScale;
let monthlyData = {};
let data;
let nestedData;
let drawCharts;
let margin = { top: 20, right: 20, bottom: 30, left: 50 };
let width = window.innerWidth * 0.59 - margin.left - margin.right;
let height = 200 - margin.top - margin.bottom;
let parseDate = d3.timeParse("%d-%b-%y");
let xScale, yScale, line;
let svg,
  dataRange = [];
let filteredData;
let selectBubble;
let unitMap;
let selectedYear;
var elmntToView;
var selectedYearMT;
let theme = "light";

const coordinates = [
  { name: "Boonsri", long: 55, lat: 21.6, size: 0 },
  { name: "Kohsoom", long: 75, lat: 33.33, size: 0 },
  { name: "Achara", long: 43.33, lat: 35, size: 0 },
  { name: "Busarakhan", long: 74.16, lat: 43.33, size: 14 },
  { name: "Somchair", long: 34.16, lat: 47.16, size: 0 },
  { name: "Chai", long: 61.66, lat: 49.16, size: 0 },
  { name: "Decha", long: 15, lat: 60, size: 0 },
  { name: "Tansanee", long: 34.16, lat: 68.33, size: 0 },
  { name: "Kannika", long: 66.66, lat: 71.66, size: 0 },
  { name: "Sakda", long: 54.16, lat: 85.83, size: 0 },
];
var pointMapSvg;
var heightView1;
var widthView1;
var circles;
var view1 = true;
var veiw2 = false;
var size = d3
  .scaleLinear()
  .domain([1, 1000]) // What's in the data
  .range([10, 50]); // Size in pixel

// Load external data and boot
document.addEventListener("DOMContentLoaded", function () {
  pointMapSvg = d3.select("#pointmapsvg");
  heightView1 = pointMapSvg.attr("height");
  widthView1 = pointMapSvg.attr("width");
  selectedYear = +document.getElementById("yearRange").value;

  Promise.all([d3.csv("data/Boonsong Lekagul waterways readings.csv")]).then(
    function (data) {
      waterwaysData.push(data);
    }
  );

  Promise.all([d3.csv("data/chemical units of measure.csv")]).then(function (
    data
  ) {
    addMeasures(data[0]);
  });

  Promise.all([d3.csv("final.csv")]).then(function (values) {
    csv = values[0];
    csv.forEach((element) => {
      for (var key in element) {
        if (key == "value") {
          element.value = +element.value;
        }
      }
    });
  });
  createPointMap();
});

const pointInPolygon = function (point, vs) {
  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

function drawPath() {
  const lineGenerator = d3.line();
  d3.select("#lasso")
    .style("stroke", "black")
    .style("stroke-width", 2)
    .style("fill", "#00000054")
    .attr("d", lineGenerator(coords));
}

function dragStart() {
  coords = [];
  d3.selectAll("#heatmap").remove();
  d3.selectAll("#heatmapLegend").remove();
  d3.selectAll("#heatmap-header").remove();
  d3.selectAll("#heatmap-header-1").remove();
  d3.selectAll("#innovative-header").remove();
  d3.selectAll("#innovative-header-1").remove();
  // d3.select("#inno").remove();
  circles.attr("fill", "steelblue");
  d3.select("#lasso").remove();
  d3.select("#pointmapsvg").append("path").attr("id", "lasso");
}

function dragMove(event) {
  let mouseX = event.sourceEvent.offsetX;
  let mouseY = event.sourceEvent.offsetY;
  coords.push([mouseX, mouseY]);
  drawPath();
}

function dragEnd() {
  let selectedDots = [];
  circles.each((d, i) => {
    let point = [(d.long * widthView1) / 100, (d.lat * heightView1) / 100];
    if (pointInPolygon(point, coords)) {
      d3.select("#point-" + d.name).attr("fill", "red");
      selectedDots.push(d.name);
    }
  });
  view1Clicked(true);
  createInnovativeChart(selectedDots);
}

function createPointMap() {
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  circles = pointMapSvg
    .append("g")
    .selectAll("myCircles")
    .data(coordinates)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", function (d) {
      return (d.long * widthView1) / 100;
    })
    .attr("cy", function (d) {
      return (d.lat * heightView1) / 100;
    })
    .attr("r", function (d) {
      return size(d.size);
    })
    .style("fill", "69b3a2")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 3)
    .attr("fill-opacity", 0.4)
    .on("mouseover", function (d) {
      div.transition().duration(200).style("opacity", 1);
    })
    .on("mousemove", function (event, i) {
      div.transition().duration(100).style("opacity", 0.9);
      div
        .html("Location: " + i.name)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 30 + "px");
      d3.select(this).attr("stroke", "#bada55").attr("stroke-width", 6);
    })
    .on("mouseout", function (d) {
      div.transition().duration(100).style("opacity", 0);
      d3.select(this).attr("stroke", "#69b3a2").attr("stroke-width", 3);
    })
    .on("click", (d, i) => {
      var VLineBubble = document.getElementById("linechart1");
      VLineBubble.style.display = "block";
      view2Clicked(true);
      currentSelectedPoint = i.name;
      document.getElementById("selectedLocation").textContent = i.name;
      displayBubbleChart(null, false);
      selectedLocation = i.name;
      if (selectedLocation === "all") {
        filteredData = data;
      } else {
        filteredData = data.filter(function (d) {
          return d.location === selectedLocation;
        });
      }
      xScale = undefined;
      drawCharts();
    });

  let coords = [];

  const drag = d3
    .drag()
    .on("start", dragStart)
    .on("drag", dragMove)
    .on("end", dragEnd);

  d3.select("#pointmapsvg").call(drag);
}

function addMeasures(measureData) {
  waterwaysMeasures = measureData;
  waterwaysMeasures.forEach((d) => {
    measureList.push(d.measure);
  });
  addMeasuresToList();
}

function addMeasuresToList() {
  var x = document.getElementById("Contaminant");
  var a = document.getElementById("Contaminant1");
  measureList.forEach((d) => {
    var option = document.createElement("option");
    if (d === contaminantValue) {
      option.defaultSelected = true;
    }
    option.text = d;
    option.value = d;
    x.add(option);
  });
}

function defineOpacity(data) {
  var means = [];
  coordinates.forEach((c) => {
    var count = [];
    data.forEach((d) => {
      if (c.name === d.location) {
        count.push(d.value);
      }
    });
    var mean = count.length === 0 ? 0 : d3.mean(count);
    means.push(mean);
  });

  coordinates.forEach((c) => {
    var count = [];
    data.forEach((d) => {
      if (c.name === d.location) {
        count.push(d.value);
      }
    });
    var mean = count.length === 0 ? 0 : d3.mean(count);
    means.push(mean);
    var normal =
      mean === 0 ? 0 : (mean - d3.min(means)) / (d3.max(means) - d3.min(means));
    c.size = normal * 100 * 14;
  });

  d3.select("g").remove();
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  circles = pointMapSvg
    .append("g")
    .selectAll("myCircles")
    .data(coordinates)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", function (d) {
      return (d.long * widthView1) / 100;
    })
    .attr("cy", function (d) {
      return (d.lat * heightView1) / 100;
    })
    .attr("r", function (d) {
      return size(d.size);
    })
    .style("fill", "69b3a2")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 3)
    .attr("fill-opacity", 0.4)
    .on("mouseover", function (d) {
      div.transition().duration(200).style("opacity", 1);
    })
    .on("mousemove", function (event, i) {
      div.transition().duration(100).style("opacity", 0.9);
      div
        .html("Location: " + i.name)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 30 + "px");
      d3.select(this).attr("stroke", "#bada55").attr("stroke-width", 6);
    })
    .on("mouseout", function (d) {
      div.transition().duration(100).style("opacity", 0);
      d3.select(this).attr("stroke", "#69b3a2").attr("stroke-width", 3);
    })
    .on("click", (d, i) => {
      var VLineBubble = document.getElementById("linechart1");
      VLineBubble.style.display = "block";
      view2Clicked(true);
      currentSelectedPoint = i.name;
      document.getElementById("selectedLocation").textContent = i.name;
      displayBubbleChart(null, false);
    });
}

function rangeChanged() {
  year = document.getElementById("yearRange").value;
  selectedYear = +document.getElementById("yearRange").value;
  filterData(contaminantValue, year);
  displayBubbleChart(null, false);
}

function contaminantChanged() {
  var e = document.getElementById("Contaminant");
  contaminantValue = e.value;
  filterData(contaminantValue, year);
}

function filterData(contaminant, year) {
  filteredDataView1 = [];
  waterwaysData[0][0].forEach((data) => {
    var parser = d3.timeParse("%d-%b-%y");
    var mydate = parser(data["sample date"]);
    // var mydate = new Date(data["sample date"]); // not working for firefox. need some other solutions.
    if (contaminant == data["measure"] && year == mydate.getFullYear()) {
      filteredDataView1.push(data);
    }
  });
  defineOpacity(filteredDataView1);
}

function createInnovativeChart(regions) {
  // set the dimensions and margins of the graph
  // Show loader
  d3.select("#loader").style("display", "block");
  d3.selectAll("#innovative-header").remove();
  d3.selectAll("#innovative-header-1").remove();
  elmntToView = document.getElementById("innovativeChart");
  elmntToView.scrollIntoView();

  if (regions.length > 0) {
    const header = d3.select("#innovativeChart");

    header
      .append("text")
      .attr("x", 1000)
      .attr("y", 0)
      .attr("dy", "30px")
      .attr("class", "innovative-header")
      .attr("id", "innovative-header")
      .text("Innovative Chart");
    const header1 = d3.select("#innovativeChart");

    header1
      .append("text")
      .attr("x", 1000)
      .attr("y", 30)
      .attr("dy", "10px")
      .attr("class", "innovative-header-1")
      .attr("id", "innovative-header-1")
      .text(
        "shows normalized concentrations of the most significant contaminants from 1998 - 2016"
      );
  }

  var margin = { top: 30, right: 30, bottom: 70, left: 60 },
    innoWidth = 1000 - margin.left - margin.right,
    innoHeight = 600 - margin.top - margin.bottom;
  d3.select("#inno").remove();

  var years = [
    1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
    2010, 2011, 2012, 2013, 2014, 2015, 2016,
  ];
  var chemicals = [
    "Water temperature",
    "Nitrites",
    "Ammonium",
    "Nitrates",
    "Orthophosphate-phosphorus",
    "Total phosphorus",
    "Dissolved oxygen",
    "Biochemical Oxygen",
    "Manganese",
    "Chlorides",
  ];

  var myColor = d3
    .scaleOrdinal()
    .domain(regions)
    .range([
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
    ]);

  var innovativeData = [];
  waterwaysData[0][0].forEach((d) => {
    if (regions.includes(d.location) && chemicals.includes(d.measure)) {
      var parser = d3.timeParse("%d-%b-%y");
      var mydate = parser(d["sample date"]);
      var myYear = mydate.getFullYear();
      innovativeData.push({
        location: d.location,
        measure: d.measure,
        year: myYear,
        value: d.value,
        id: d.location + "_" + d.measure + "_" + myYear,
      });
    }
  });

  const myMap = new Map();
  let newData = [];
  innovativeData.forEach((data) => {
    var id = data.id;
    myMap.set(
      id,
      d3.mean(
        innovativeData.filter((d) => d.id == id),
        (d) => d.value
      )
    );
  });

  // for loop over map , key will be split via underscore to get loc, measure and year.
  // make a new hashmap newdata
  let means = [];
  myMap.forEach((val, key) => {
    const [area, contaminant, sampleYear] = key.split("_");
    newData.push({
      location: area,
      measure: contaminant,
      year: parseInt(sampleYear),
      mean: val,
    });
    means.push(val);
  });

  newData.forEach((data) => {
    var normal =
      data.mean === 0
        ? 0
        : (data.mean - d3.min(means)) / (d3.max(means) - d3.min(means));
    data.mean = normal;
  });

  if (newData.length > 0) {
    var innovativeChartSvg = d3
      .select("#innovativeChart")
      .append("svg")
      .attr("id", "inno")
      .attr("width", innoWidth + margin.left + 400 + margin.right)
      .attr("height", innoHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + 200 + "," + margin.top + ")");
    const legend = d3.select("#inno");

    // X axis
    var x = d3
      .scaleBand()
      .range([0, innoWidth])
      .domain(
        years.map(function (d) {
          return d;
        })
      )
      .padding(1);
    innovativeChartSvg
      .append("g")
      .attr("transform", "translate(0," + widthView1 + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");
    // Y axis
    var y = d3
      .scaleBand()
      .range([innoHeight, 0])
      .domain(
        chemicals.map(function (d) {
          return d;
        })
      );
    innovativeChartSvg.append("g").call(d3.axisLeft(y));

    innovativeChartSvg
      .append("text")
      .attr("class", "axis-label fadeInUp")
      .attr("transform", "rotate(-90)")
      .attr("y", "-180px")
      .attr("x", "-230px")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Contaminants");
    innovativeChartSvg
      .append("text")
      .attr("class", "axis-label fadeInUp")
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .attr("x", "450px")
      .attr("y", "560px")
      .text("Years");

    var tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var keys = [];
    regions.forEach((r) => {
      keys.push({
        key: r,
        color: myColor(r),
      });
    });

    innovativeChartSvg
      .append("g")
      .selectAll("dot")
      .data(newData)
      .enter()
      .append("circle")
      .attr("class", "inno-dot")
      .attr("cx", function (d) {
        return x(d.year);
      })
      .attr("cy", function (d) {
        return y(d.measure) + 23;
      })
      .attr("r", function (d) {
        return d.mean * 40;
      })
      .style("fill", function (d) {
        return myColor(d.location);
      })
      .style("opacity", 0.4)
      .attr("stroke", "white")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            "Location: " +
              d.location +
              "<br/>" +
              "Normalized value: " +
              d.mean.toFixed(4)
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 30 + "px");
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mousemove", function (event, d) {
        tooltip
          .style("stroke", "black")
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 30 + "px");
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).attr("stroke", "white").attr("stroke-width", 1);
      })
      .on("click", function (key, d) {
        generateHeatmap(d.measure, d.year, regions);
      });
    var size = 20;
    legend
      .selectAll("mycircles")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", 1110)
      .attr("cy", function (d, i) {
        return i * (size + 5) + 21;
      })
      .attr("r", 10)
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) {
        return d.color;
      })
      .style("opacity", 0.4);
    legend
      .selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 1125)
      .attr("y", function (d, i) {
        return i * (size + 5) + size / 2 + 13;
      })
      .text(function (d) {
        return d.key;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  }
  // Hide loader
  d3.select("#loader").style("display", "none");
}

function view2Clicked(viewCreated) {
  view1 = false;
  view2 = true;
  var V2 = document.getElementById("View2");
  V2.style.display = "block";
  var V1 = document.getElementById("View1");
  V1.style.display = "none";
  var element = document.getElementById("View2Head");
  element.style.fontWeight = "bold";
  var element = document.getElementById("View1Head");
  element.style.fontWeight = "normal";
  if (!viewCreated) {
    takeTOPoint();
  }
}
function view1Clicked(viewCreated) {
  view1 = true;
  view2 = false;
  var V2 = document.getElementById("View2");
  V2.style.display = "none";
  var V1 = document.getElementById("View1");
  V1.style.display = "block";
  var element = document.getElementById("View1Head");
  element.style.fontWeight = "bold";
  var element = document.getElementById("View2Head");
  element.style.fontWeight = "normal";
  if (!viewCreated) {
    takeTOPoint();
  }
}

function generateHeatmap(chemical_value, year_value, regions) {
  d3.selectAll("#heatmap").remove();
  d3.selectAll("#heatmapLegend").remove();
  d3.selectAll("#heatmap-header").remove();
  d3.selectAll("#heatmap-header-1").remove();
  var unit;

  waterwaysMeasures.forEach((w) => {
    if (w.measure === chemical_value) {
      if (w.unit === "mg/l" || w.unit === "C") {
        unit = w.unit;
      } else {
        unit = decodeURI("\u03BC") + "/l";
      }
    }
  });

  const header = d3.select("#Heatmap");
  header
    .append("text")
    .attr("x", 1000)
    .attr("y", 0)
    .attr("dy", "30px")
    .attr("class", "heatmap-header")
    .attr("id", "heatmap-header")
    .text("Heatmap");
  const header1 = d3.select("#Heatmap");

  header1
    .append("text")
    .attr("x", 1000)
    .attr("y", 30)
    .attr("dy", "10px")
    .attr("class", "heatmap-header-1")
    .attr("id", "heatmap-header-1")
    .text(
      "shows values of " +
        chemical_value +
        " (" +
        unit +
        ") " +
        " for the year " +
        year_value
    );
  var width = 900,
    height = 105,
    cellSize = 12; // cell size
  week_days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  var day = d3.timeFormat("%w"),
    week = d3.timeFormat("%U"),
    percent = d3.format(".1%"),
    format = d3.timeFormat("%Y-%m-%d");

  var colors = [
    "#A50026",
    "#D73027",
    "#F46D43",
    "#FDAE61",
    "#FEE08B",
    "#FFFFBF",
    "#D9EF8B",
    "#A6D96A",
    "#66BD63",
    "#66BD63",
    "#006837",
  ];

  var locations = regions;

  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0),
      w0 = +week(t0),
      d1 = +day(t1),
      w1 = +week(t1);
    return (
      "M" +
      (w0 + 1) * cellSize +
      "," +
      d0 * cellSize +
      "H" +
      w0 * cellSize +
      "V" +
      7 * cellSize +
      "H" +
      w1 * cellSize +
      "V" +
      (d1 + 1) * cellSize +
      "H" +
      (w1 + 1) * cellSize +
      "V" +
      0 +
      "H" +
      (w0 + 1) * cellSize +
      "Z"
    );
  }
  function plot_legend(max) {
    //$("rect").tooltip({container: 'body', html: true, placement:'top'});
    var margin = { top: 30, right: 50, bottom: 160, left: 50 };
    var legend_width = 600 - margin.left - margin.right,
      legend_height = 400 - margin.top - margin.bottom;
    var color_legend = d3
      .select("#Heatmap")
      .append("div")
      .attr("id", "heatmapLegend")
      .append("svg")
      .attr("width", legend_width + margin.left + margin.right)
      .attr("height", legend_height + margin.top + margin.bottom)
      .attr("class", "colorlegend");

    color_legend
      .selectAll()
      .data(colors.reverse())
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        return legend_width - i * 33 - 20;
      })
      .attr("y", 30)
      .attr("width", 30)
      .attr("height", 15)
      .attr("fill", function (d, i) {
        return colors[i];
      });

    function compute_value(i) {
      return Number.parseFloat(Math.pow(i, 2) * max).toFixed(2);
    }

    var arr = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0];
    var new_arr = arr.map(compute_value);
    var legendData = [];
    for (i = 0; i < new_arr.length; i++) {
      legendData.push({ data: new_arr[i], color: colors[new_arr.length - i] });
    }
    color_legend
      .selectAll("legend_labels")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", function (d, i) {
        return legend_width - i * 33 - 20;
      })
      .attr("y", 55)
      .text((d) => d.data)
      .style("font-size", "10px");
  }
  function plot_heatmap(heatData, heatLocation, heatYear) {
    var color = d3
      .scaleQuantize()
      .domain([0, 1])
      .range(
        d3.range(11).map(function (d) {
          return "q" + d + "-11";
        })
      );
    var svg = d3
      .select("#Heatmap")
      .append("svg")
      .attr("width", "100%")
      .attr("data-height", "0.5678")
      .attr("viewBox", "0 0 900 105")
      .attr("class", "RdYlGn")
      .attr("id", "heatmap")
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (width - cellSize * 53) / 2 +
          "," +
          (height - cellSize * 7 - 1) +
          ")"
      );
    svg
      .data(heatLocation)
      .append("text")
      .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .text(heatLocation);
    for (var i = 0; i < 7; i++) {
      svg
        .append("text")
        .attr("transform", "translate(-5," + cellSize * (i + 1) + ")")
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .attr("dy", "-.25em")
        .text(function (d) {
          return week_days[i];
        });
    }
    var rect = svg
      .selectAll(".day")
      .data(d3.timeDays(new Date(heatYear, 0, 1), new Date(heatYear + 1, 0, 1)))
      .enter()
      .append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function (d) {
        return week(d) * cellSize;
      })
      .attr("y", function (d) {
        return day(d) * cellSize;
      })
      .attr("fill", "#fff")
      .datum(format);
    var legend = svg
      .selectAll(".legend")
      .data(month)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(" + ((i + 1) * 50 + 8) + ",0)";
      });

    legend
      .append("text")
      .attr("class", function (d, i) {
        return month[i];
      })
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .attr("dy", "-.25em")
      .text(function (d, i) {
        return month[i];
      });

    svg
      .selectAll(".month")
      .data(function (d) {
        return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
      })
      .enter()
      .append("path")
      .attr("class", "month")
      .attr("id", function (d, i) {
        return month[i];
      })
      .attr("d", monthPath);

    var tooltip = d3
      .select("body")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip");

    // // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          "The exact value of<br>this cell is: " +
            Math.round(Math.pow(heatData.get(d), 2) * max, 2)
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 30 + "px");
      d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
    };
    const mousemove = function (event, d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html(
          "The exact value of<br>this cell is: " +
            Math.round(Math.pow(heatData.get(d), 2) * max, 2) +
            "<br>" +
            "Date: " +
            d
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 30 + "px");
      d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
    };
    const mouseleave = function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0);
      d3.select(this).attr("stroke", "white").attr("stroke-width", 1);
    };
    rect
      .filter(function (d) {
        return heatData.has(d);
      })
      .attr("class", function (d) {
        return "day " + color(heatData.get(d));
      })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
  }
  var data = csv.filter(function (d) {
    return d.year == year_value && d.measure == chemical_value;
  });
  var max = d3.max(data, function (d) {
    return d.value;
  });
  var data = d3
    .nest()
    .key(function (d) {
      return d.location;
    })
    .key(function (d) {
      return d.sample_date;
    })
    .rollup(function (d) {
      return Math.sqrt(d[0].value / max);
    })
    .map(data);
  data = new Map(Object.entries(data));
  var larger_values = [];
  function getDates(location) {
    var dates = [];
    if (data.get("$" + location) === undefined) {
      return dates;
    }
    var keys = Object.keys(data.get("$" + locations[i]));
    for (j = 0; j < keys.length; j++) {
      dates.push(keys[j].replace("$", ""));
    }
    return dates;
  }
  function getValues(location) {
    var values = [];
    var keys = Object.keys(data.get("$" + locations[i]));
    var objval = Object.values(data.get("$" + locations[i]));
    for (j = 0; j < keys.length; j++) {
      values.push(objval[j]);
    }
    return values;
  }
  for (i = 0; i < locations.length; i++) {
    if (getDates(locations[i]).length == 0) {
      continue;
    } else {
      var dates = getDates(locations[i]);
      var values = getValues(locations[i]);
      var new_map = new Map();
      for (j = 0; j < dates.length; j++) {
        new_map.set(dates[j], values[j]);
      }
      plot_heatmap(new_map, locations[i], year_value);
    }
  }
  plot_legend(max);
  elmntToView = document.getElementById("Heatmap");
  elmntToView.scrollIntoView();
}

const displayBubbleChart = (allData, flag) => {
  let bubbleChartData;
  if (flag == false) {
    bubbleChartData = waterwaysData[0][0].filter(
      (record) =>
        record.location === currentSelectedPoint &&
        new Date(record["sample date"].replace(/-/g, "/")).getFullYear() ===
          selectedYear
    );
  } else {
    bubbleChartData = allData.filter(
      (record) =>
        new Date(record["sample date"].replace(/-/g, "/")).getFullYear() ===
        selectedYear
    );
  }
  bubbleChartData = bubbleChartData.map((record) => {
    const unitData = waterwaysMeasures.filter(
      (item) => item.measure === record.measure
    );
    if (unitData[0].unit.includes("m")) {
      return {
        ...record,
        value: record.value * 1000,
      };
    }
    return record;
  });

  const bubbleData = [];
  measureList.map((measure) =>
    bubbleData.push({
      measure: measure,
      value: d3.mean(
        bubbleChartData.filter((d) => d.measure === measure),
        (d) => d.value
      ),
    })
  );
  filteredBubbleData = bubbleData.filter(
    (x) => x.value != undefined && x.value != 0
  );
  plotBubbleChart(filteredBubbleData);
  elmntToView = document.getElementById("linechart1");
  elmntToView.scrollIntoView();
};

// Set up color scale for different measures
colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const plotBubbleChart = (data) => {
  let bubbleMeasures = [];
  d3.select("#bubblechartsvg").html("");

  const bubbleSvg = d3.select("#bubblechartsvg");
  let height = +bubbleSvg.attr("height");
  let width = +bubbleSvg.attr("width");
  let margin = { top: 30, right: 30, bottom: 30, left: 30 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  const maxRadius = d3.max(data, (d) => d.value);

  // Size scale for countries
  var size = d3.scaleLinear().domain([0, maxRadius]).range([15, 65]); // circle will be between 7 and 55 px wide

  // create a tooltip
  const Tooltip = d3
    .select("#scatterplot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip_bubble")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("position", "absolute")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const mouseover = function (d) {
    Tooltip.style("opacity", 1);
  };
  const mousemove = function (event, d) {
    Tooltip.html(
      "<u>" +
        d.measure +
        "</u>" +
        "<br>" +
        d.value +
        `${d.measure === "Water temperature" ? " C" : " " +decodeURI("\u03BC") + "/l"}`
    )
      .style("left", event.pageX + 20 + "px")
      .style("top", event.pageY + "px");
  };
  const mouseleave = function (d) {
    Tooltip.style("opacity", 0);
  };

  bubbleSvg.append("g");
  // Initialize the circle: all located at the center of the svg area
  const node = bubbleSvg
    .selectAll(".node")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", function (d) {
      return size(d.value);
    })
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .style("fill", function (d) {
      return colorScale(d.measure);
    })
    .style("fill-opacity", 0.8)
    .attr("stroke", "black")
    .style("stroke-width", 1)
    .attr("cursor", "pointer")
    .on("mouseover", mouseover) // What to do when hovered
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("click", (d, i) => {
      if (bubbleMeasures.length === 0) {
        selectedMeasures = [];
        d3.selectAll("#selectAllCheckbox").property("checked", false);
        d3.selectAll(".measureCheckbox").property("checked", false);
      }
      // document.getElementById(`#${i.measure}`).checked = true;
      d3.select(`#${i.measure.replace(" ", "").slice(0, 10)}`).property(
        "checked",
        true
      );
      bubbleMeasures.push(i.measure);
      // filterLineChart(d, i.measure);
      drawCharts();
    });

  // Features of the forces applied to the nodes:
  var simulation = d3
    .forceSimulation()
    .force(
      "center",
      d3
        .forceCenter()
        .x(width / 2)
        .y(height / 2)
    ) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
    .force(
      "collide",
      d3
        .forceCollide()
        .strength(0.2)
        .radius(function (d) {
          return size(d.value) + 3;
        })
        .iterations(1)
    ); // Force that avoids circle overlapping

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation.nodes(data).on("tick", function (d) {
    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  });
};

d3.csv("./data/chemical units of measure.csv").then(function (unitData) {
  // Create a map to store the unit data
  unitMap = new Map();
  unitData.forEach(function (d) {
    if (d.unit === "mg/l" || d.unit === "C") {
      unitMap.set(d.measure, d.unit);
    } else {
      unitMap.set(d.measure, decodeURI("\u03BC") + "/l");
    }
  });

  // Show loader
  d3.select(".loader").style("display", "block");

  // Load data from CSV file of water ways
  d3.csv("./data/Boonsong Lekagul waterways readings.csv").then(function (
    allData
  ) {
    displayBubbleChart(allData, true);

    data = allData;
    var locations = [...new Set(data.map((d) => d.location))];
    locations.unshift("all");
    selectedLocation = "all";
    if (selectedLocation === "all") {
      filteredData = data;
    } else {
      filteredData = data.filter(function (d) {
        return d.location === selectedLocation;
      });
    }
    // Hide loader
    d3.select(".loader").style("display", "none");

    d3.select("#locationDropdown")
      .selectAll("option")
      .data(locations)
      .enter()
      .append("option")
      .attr("value", function (d) {
        return d;
      })
      .text((d) => d);

    // Convert date string to date object
    var parseDate = d3.timeParse("%d-%b-%y");
    data.forEach(function (d) {
      d["sample date"] = parseDate(d["sample date"]);
      d.value = +d.value;
    });

    // Group data by measure column
    nestedData = d3.group(data, function (d) {
      return d.measure;
    });

    // Render checkboxes for measures
    var checkboxesContainer = d3.select("#checkboxesContainer");
    nestedData.forEach(function (values, key) {
      checkboxesContainer
        .append("label")
        .attr("class", "chemicalLabel")
        .html(
          `<input type="checkbox" id=${key
            .replace(" ", "")
            .slice(
              0,
              10
            )} class="measureCheckbox" checked value="${key}" > ${key}`
        );
    });

    // Function to draw chart for selected measures

    // Initial draw of charts with all measures selected
    drawCharts();

    var fromDropdown = d3.select("#fromDropdown");
    var toDropdown = d3.select("#toDropdown");
    var years = d3.range(1998, 2017);

    fromDropdown
      .selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .attr("value", function (d) {
        return d;
      })
      .text(function (d) {
        return d;
      });

    toDropdown
      .selectAll("option")
      .data(years.concat(2017))
      .enter()
      .append("option")
      .attr("value", function (d) {
        return d;
      })
      .attr("selected", function (d) {
        // add selected attribute for 2017
        return d === 2017 ? "selected" : null;
      })
      .text(function (d) {
        return d;
      });

    selectBubble = (measures) => {
      selectedMeasures = measures;
      nestedData = d3.group(filteredData, function (d) {
        return d.measure;
      });
      drawCharts();
    };

    function showSelectedDates() {
      var fromDate = document.getElementById("fromDropdown").value;
      var toDate = document.getElementById("toDropdown").value;

      if (fromDate >= toDate) {
        alert(
          "❗Selected date range is invalid : From " +
            fromDate +
            " to " +
            toDate
        );
      } else {
        dataRange.splice(0, dataRange.length);
        dataRange.push(fromDate, toDate);
        // Filter data for the date range
        filteredData = data.filter(function (d) {
          return (
            d["sample date"].getFullYear() >= parseInt(dataRange[0]) &&
            d["sample date"].getFullYear() <= parseInt(dataRange[1])
          );
        });

        // Group filtered data by measure column
        nestedData = d3.group(filteredData, function (d) {
          return d.measure;
        });
        xScale = undefined;
        drawCharts();
      }
    }
    d3.select("#submitRange").on("click", showSelectedDates);

    // Event listener for measure checkboxes
    d3.selectAll(".measureCheckbox").on("click", function () {
      drawCharts();
    });

    // Event listener for select all checkbox
    d3.select("#selectAllCheckbox").on("change", function () {
      var isChecked = d3.select(this).property("checked");
      d3.selectAll(".measureCheckbox").property("checked", isChecked);
      drawCharts();
    });

    // Function to update chart based on location selection
    d3.select("#locationDropdown").on("change", function () {
      selectedLocation = this.value;
      if (selectedLocation === "all") {
        filteredData = data;
      } else {
        filteredData = data.filter(function (d) {
          return d.location === selectedLocation;
        });
      }

      // // Filter data for the date range 1998 to 2005
      // filteredData = filteredData.filter(function (d) {
      //   return (
      //     d["sample date"].getFullYear() >= 1998 &&
      //     d["sample date"].getFullYear() <= 2005
      //   );
      // });

      nestedData = d3.group(filteredData, function (d) {
        return d.measure;
      });
      // d3.selectAll(".chart").remove();
      drawCharts();
    });

    // Select the search
    var searchInput = d3.select("#searchInput");

    // Add an event listener for input changes in the search input
    searchInput.on("input", function () {
      var searchText = this.value.toLowerCase();

      // Filter the checkboxes based on the search text
      d3.selectAll(".chemicalLabel").each(function () {
        var label = d3.select(this);
        var checkbox = label.select("input");
        var labelText = checkbox.property("value").toLowerCase();
        if (labelText.indexOf(searchText) === -1) {
          label.style("display", "none");
        } else {
          label.style("display", "block");
        }
      });
    });
  });
});

drawCharts = () => {
  // Clear existing charts
  d3.select("#charts").html("");
  selectedMeasures = [];
  nestedData = d3.group(filteredData, function (d) {
    return d.measure;
  });
  d3.selectAll(".measureCheckbox").each(function (d) {
    var checkbox = d3.select(this);
    if (checkbox.property("checked")) {
      selectedMeasures.push(checkbox.property("value"));
    }
  });
  selectedMeasures.forEach(function (measure) {
    var measureData = nestedData.get(measure);

    var currentData = measureData;
    // Calculate mean and median
    var mean = d3.mean(currentData, function (d) {
      return d.value;
    });
    var median = d3.median(currentData, function (d) {
      return d.value;
    });

    // Create SVG for chart
    svg = d3
      .select("#charts")
      .append("svg")
      .attr("class", "chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("border-radius", "8px")
      .style("background-color", function () {
        var color = colorScale(measure);
        return d3.rgb(color).toString().replace(")", ", 0.25)");
      })
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up X and Y scales
    if (xScale === undefined)
      xScale = d3
        .scaleTime()
        .range([0, width])
        .domain(
          d3.extent(measureData, function (d) {
            return d["sample date"];
          })
        );

    yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(measureData, function (d) {
          return d.value;
        }),
      ]);

    // Create line generator
    line = d3
      .line()
      .x(function (d) {
        return xScale(d["sample date"]);
      })
      .y(function (d) {
        return yScale(d.value);
      })
      .curve(d3.curveBasis);

    // Append X and Y axes
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    svg
      .append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    //Chart title
    svg
      .append("text")
      .attr("class", "chart-title fadeInUp")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", theme === "light" ? "black" : "white")
      .text(
        "Measure: " +
          measure +
          " " +
          "(" +
          unitMap.get(measure) +
          ")" +
          " => " +
          "Mean: " +
          mean.toFixed(2) +
          ", " +
          "Median: " +
          median.toFixed(2)
      )
      .select(".line")
      .attr("fill", "none");

    // Append mean and median lines
    svg
      .append("line")
      .attr("class", "mean-line")
      .attr("x1", xScale(xScale.domain()[0]))
      .attr("y1", yScale(mean))
      .attr("x2", xScale(xScale.domain()[1]))
      .attr("y2", yScale(mean))
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    // svg
    //   .append("text")
    //   .attr("class", "mean-label")
    //   .attr("x", xScale(xScale.domain()[1]))
    //   .attr("y", yScale(mean))
    //   .attr("dy", "-0.5em")
    //   .attr("text-anchor", "end")
    //   .attr("fill", "red")
    //   .text("Mean: " + mean.toFixed(2));

    svg
      .append("line")
      .attr("class", "median-line")
      .attr("x1", xScale(xScale.domain()[0]))
      .attr("y1", yScale(median))
      .attr("x2", xScale(xScale.domain()[1]))
      .attr("y2", yScale(median))
      .attr("stroke", "blue")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    // Append line path
    svg
      .append("path")
      .datum(measureData)
      .attr("class", "line")
      .attr("d", line)
      .style("stroke", colorScale(measure))
      .on("mouseover", function (event, d) {
        var mouseX = xScale.invert(event.clientX - margin.left);
        var bisect = d3.bisector(function (d) {
          return d["sample date"];
        }).left;
        var index = bisect(d, mouseX);
        var d0 = d[index - 1];
        var d1 = d[index];
        var d =
          mouseX - d0["sample date"] > d1["sample date"] - mouseX ? d1 : d0;
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(
            "X: " +
              d3.timeFormat("%d-%b-%Y")(d["sample date"]) +
              "<br/>" +
              "Y: " +
              d3.format(".2f")(d.value)
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })

      .on("mouseout", function () {
        d3.select("#tooltip").style("opacity", 0);
      })
      .on("click", function (event, d) {
        var mouseX = xScale.invert(event.clientX - margin.left);
        var bisect = d3.bisector(function (d) {
          return d["sample date"];
        }).left;
        var index = bisect(d, mouseX);
        var d0 = d[index - 1];
        var d1 = d[index];
        var d =
          mouseX - d0["sample date"] > d1["sample date"] - mouseX ? d1 : d0;
        // Update selectedYear and selectedMeasure
        selectedYearMT = parseInt(d3.timeFormat("%Y")(d["sample date"]));
        selectedMeasure = measure;

        // d3.select("#popup-content").html("");
        d3.select("#monthTrendChart").remove();
        drawChart(selectedYearMT, selectedMeasure);
        showPopup();
      })
      .attr("stroke-dasharray", function () {
        return this.getTotalLength() + " " + this.getTotalLength();
      })
      .attr("stroke-dashoffset", function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  });
};

// --------------CODE FOR ON CLOCK LOLLIPOP CHART -----------------------------------------------------------------
// Function to draw monthly trend chart for selected measures
// Change this to the year you want to filter
var selectedMeasure = "Water temperature";

function drawChart(selectedYearMT, selectedMeasure) {
  // Clear existing charts
  d3.select(".yearChart").remove();
  d3.select("#monthSelect").remove();
  d3.select("#monthTrendChart").remove();

  // Get selected measures
  var selectedMeasuresMonths = [];
  d3.selectAll(".measureCheckbox").each(function (d) {
    var checkbox = d3.select(this);
    if (checkbox.property("checked")) {
      selectedMeasuresMonths.push(checkbox.property("value"));
    }
  });

  selectedMeasuresMonths = selectedMeasuresMonths.filter(function (item) {
    return item === selectedMeasure;
  });

  var lineChartData = [];

  // Loop through selected measures
  selectedMeasuresMonths.forEach(function (measure) {
    var measureData = nestedData.get(measure);

    // Group data by month
    var dataByMonth = d3.group(measureData, function (d) {
      return d3.timeMonth(d["sample date"]);
    });

    // Calculate average of values by month
    var dataForLineChart = [];
    dataByMonth.forEach(function (values, key) {
      var month = key;
      var sum = d3.sum(values, function (d) {
        return d.value;
      });
      var average = sum / values.length;
      dataForLineChart.push({ month: month, average: average });
    });

    // Add data for current measure to lineChartData array
    lineChartData.push({
      measure: measure,
      data: dataForLineChart,
    });

    var chartData = lineChartData[0].data;

    // initialize an empty object to store the grouped data
    monthlyData = {};

    chartData.forEach((data) => {
      // extract the month and average values from each data object
      const { month, average } = data;
      // extract the month string from the month value
      const monthStr = new Date(month).toLocaleString("en-us", {
        month: "long",
      });

      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = [];
      }

      monthlyData[monthStr].push(data);
    });
  });

  // Render monthly trend and ,omth trend over years
  lineChartData.forEach(function (measureData) {
    var measure = measureData.measure;
    var data = measureData.data;

    // Filter the data for year clicked
    data = data.filter((item) => {
      return new Date(item.month).getFullYear() === selectedYearMT;
    });

    var element = document.getElementById("popup-content");
    // width = element.clientWidth * 0.85;
    var width = 725;

    // Create SVG
    svg = d3
      .select(".popup-content")
      .append("svg")
      .attr("class", "yearChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 20)
      .style("border-radius", "8px")
      .style("background-color", function () {
        var color = colorScale(measure);
        return d3.rgb(color).toString().replace(")", ", 0.25)");
      })
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top * 2 + ")"
      );

    // Set up X and Y scales
    xScale = d3
      .scaleTime()
      .range([0, width])
      .domain(
        d3.extent(data, function (d) {
          return d.month;
        })
      );

    yScale = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        d3.max(data, function (d) {
          return d.average;
        }),
      ]);

    // Create line generator
    line = d3
      .line()
      .x(function (d) {
        return xScale(d.month);
      })
      .y(function (d) {
        return yScale(d.average);
      });

    // Append X and Y axes
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")));

    svg
      .append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Value");

    //Chart title
    svg
      .append("text")
      .attr("class", "chart-title fadeInUp")
      .attr("x", width / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .style("fill", theme === "light" ? "black" : "white")
      .style("font-size", "16px")
      .text(
        "Measure: " +
          measure +
          " " +
          "(" +
          unitMap.get(measure) +
          ")" +
          " for Year - " +
          selectedYearMT
      )
      .select(".line")
      .attr("fill", "none");

    // Append lines from x-axis to circles
    svg
      .selectAll(".line")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "line")
      .attr("x1", function (d) {
        return xScale(d.month);
      })
      .attr("y1", function (d) {
        return yScale(0);
      })
      .attr("x2", function (d) {
        return xScale(d.month);
      })
      .attr("y2", function (d) {
        return yScale(d.average);
      })
      .attr("stroke", colorScale(measure))
      .attr("stroke-width", 2);

    // Append circles on top of lines to create lollipop effect
    svg
      .selectAll(".circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "circle")
      .attr("cx", function (d) {
        return xScale(d.month);
      })
      .attr("cy", function (d) {
        return yScale(d.average);
      })
      .attr("r", 4)
      .attr("fill", colorScale(measure));

    // Append text label to each circle
    svg
      .selectAll(".circle-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "circle-label")
      .attr("x", function (d) {
        return xScale(d.month);
      })
      .attr("y", function (d) {
        return yScale(d.average) - 6;
      })
      .text(function (d) {
        return d3.format(".2f")(d.average);
      })
      .attr("text-anchor", "middle")
      .attr("fill", "black"); // Set the color of the label

    // Define the months array
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Append a select element to the .yearChart element
    var select = d3
      .select("#popup-content")
      .append("select")
      .attr("id", "monthSelect");

    // Append an option element for each month
    select
      .selectAll("option")
      .data(months)
      .enter()
      .append("option")
      .text(function (d) {
        return d;
      })
      .attr("value", function (d) {
        return d;
      });

    // Retrieve the data for the selected month
    var selection = document.getElementById("monthSelect").value;
    var selectedData = monthlyData[selection];

    var svgWidth = 800;
    var svgHeight = 400;
    var marginMT = {
      top: 40,
      right: 20,
      bottom: 60,
      left: 60,
    };

    var chartWidth = svgWidth - marginMT.left - marginMT.right;
    var chartHeight = svgHeight - marginMT.top - marginMT.bottom;

    function drawMT(selectedData, selectedMonth) {
      d3.select("#monthTrendChart").remove();

      // Append the SVG canvas
      var svgMT = d3
        .select("#popup-content")
        .append("svg")
        .attr("id", "monthTrendChart")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      var chart = svgMT
        // .style("border-radius", "8px")
        // .style("background-color", function () {
        //   var color = colorScale(measure);
        //   return d3.rgb(color).toString().replace(")", ", 0.25)");
        // })
        .append("g")
        .attr(
          "transform",
          "translate(" + marginMT.left + "," + marginMT.top + ")"
        );
      // Define the x-axis scale
      var xScale = d3
        .scaleBand()
        .range([0, chartWidth])
        .domain(
          selectedData.map(function (d) {
            return d.month;
          })
        )
        .padding(0.2);

      // Define the y-axis scale
      var yScale = d3
        .scaleLinear()
        .range([chartHeight, 0])
        .domain([
          0,
          d3.max(selectedData, function (d) {
            return d.average;
          }),
        ]);

      // Append the x-axis
      chart
        .append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

      // Append the y-axis
      chart.append("g").call(d3.axisLeft(yScale));

      // Append the lollipop circles
      chart
        .selectAll(".lollipop-circle")
        .data(selectedData)
        .enter()
        .append("circle")
        .attr("class", "lollipop-circle")
        .attr("cx", function (d) {
          return xScale(d.month) + xScale.bandwidth() / 2;
        })
        .attr("cy", function (d) {
          return yScale(d.average);
        })
        .attr("r", 5)
        .attr("fill", colorScale(measure));

      // Append the lollipop stems
      chart
        .selectAll(".lollipop-stem")
        .data(selectedData)
        .enter()
        .append("line")
        .attr("class", "lollipop-stem")
        .attr("x1", function (d) {
          return xScale(d.month) + xScale.bandwidth() / 2;
        })
        .attr("y1", chartHeight)
        .attr("x2", function (d) {
          return xScale(d.month) + xScale.bandwidth() / 2;
        })
        .attr("y2", function (d) {
          return yScale(d.average);
        })
        .attr("stroke", colorScale(measure))
        .attr("stroke-width", 2);

      // Chart title for MT
      chart
        .append("text")
        .attr("class", "chart-title-MT")
        .attr("x", width / 2)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", theme === "light" ? "black" : "white")
        .text(measure + " trend on the month of ")
        .append("tspan")
        .attr("class", "underline")
        .text(selectedMonth)
        .style("text-decoration", "underline")
        .style("color", colorScale(measure))
        .append("tspan")
        .text(" over the selected date range")
        .select(".line")
        .attr("fill", "none");

      // Append text label to each circle
      chart
        .selectAll(".lollipop-circle-label")
        .data(selectedData)
        .enter()
        .append("text")
        .attr("class", "lollipop-circle-label")
        .attr("x", function (d) {
          return xScale(d.month) + xScale.bandwidth() / 2;
        })
        .attr("y", function (d) {
          return yScale(d.average) - 6;
        })
        .text(function (d) {
          return d3.format(".2f")(d.average);
        })
        .attr("text-anchor", "middle")
        .attr("fill", "black");
    }
    drawMT(selectedData, "January");

    // Function to update chart based on location selection
    d3.select("#monthSelect").on("change", function () {
      selectedData = monthlyData[this.value];
      drawMT(selectedData, this.value);
    });
  });
}
function takeTOPoint() {
  elmntToView = document.getElementById("vis-container");
  elmntToView.scrollIntoView();
}

var width = 800,
    height = 600;

var pm10_svg = d3.select("#pm10")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var pm10_map = pm10_svg.append("g").attr("id", "pm10map");

var pm25_svg = d3.select("#pm25")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var pm25_map = pm25_svg.append("g").attr("id", "pm25map");

var projection = d3.geo.mercator()
    .center([126.9895, 37.5651])
    .scale(100000)
    .translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

formatDate = d3.time.format("%b %d");
formatDateQuery = d3.time.format("%Y-%m-%d");

var pm10_date = "2016-01-01";
var pm25_date = "2016-01-01";

var pm10dict = {};
var pm25dict = {};
var pm10hourlydict = {};
var pm25hourlydict = {};

var features;

readCSV();
drawMap(pm10_map, pm10dict);
drawMap(pm25_map, pm25dict);

function readCSV() {
    d3.csv("./csv/seoul_daily.csv", function (error, csv_data) {
    // d3.csv("./data/seoul_daily.csv", function(error, csv_data) {

        console.log(pm10dict);

        csv_data.forEach(function (d) {
            pm10dict[d.날짜] = {};
        });

        csv_data.forEach(function (d) {
            pm10dict[d.날짜][d.측정소] = +d.PM10;
        });


        csv_data.forEach(function (d) {
            pm25dict[d.날짜] = {};
        });

        csv_data.forEach(function (d) {
            pm25dict[d.날짜][d.측정소] = +d.PM25;
        });

    });

    /*
    d3.csv("./csv/2016_hourly.csv", function (error, csv_data) {
        csv_data.forEach(function (d) {
            pm10hourlydict[d.날짜] = {};
        });

        csv_data.forEach(function(d) {
            pm10hourlydict[d.날짜][d.측정소] = {};
        });


        csv_data.forEach(function(d) {
            pm10hourlydict[d.날짜][d.측정소][d.시간] = +d.PM10;
        });

        csv_data.forEach(function(d) {
            pm25hourlydict[d.날짜] = {};
        });

        csv_data.forEach(function(d) {
            pm25hourlydict[d.날짜][d.측정소]= {};
        });

        csv_data.forEach(function(d) {
            pm25hourlydict[d.날짜][d.측정소][d.시간] = +d.PM25;
        });
    });
    */
}


function drawMap(map, dict) {
    d3.json("./data/seoul_municipalities_topo_simple.json", function (error, data) {
        features = topojson.feature(data, data.objects.seoul_municipalities_geo).features;
        map.selectAll('path')
            .data(features)
            .enter()
            .append("path")
            .attr("class", function(d) {
                console.log();
                return 'municipality c' + d.properties.code
            })
            .attr("d", path)

        if (map == pm10_map) {
            map.style("fill", function (d) {
                return getColorByRange10(pm10dict[pm10_date][d.properties.name]);
            })
                .on("click", function(d) {
                    drawPieChart10({'측정소':d.properties.name, '월':pm10_date.substring(5, 7)})
                });
        }
        else if (map == pm25_map) {
            map.style("fill", function (d) {
                return getColorByRange25(pm25dict[pm25_date][d.properties.name]);
            })
                .on("click", function(d) {
                    drawPieChart25({'측정소':d.properties.name, '월':pm25_date.substring(5, 7)})
                });
        }

        map.selectAll('text')
            .data(features)
            .enter().append("text")
            .attr("transform", function (d) {
                return "translate(" + path.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .attr("class", "municipality-label")

            .text(function (d) {
                return d.properties.name;
            })
    });
}

function getColorByRange10(val) {
    if (val >= 0 && val <= 30) {
        return "rgb(70, 90, 235)";
    }
    else if (val >= 31 && val <= 80) {
        return "rgb(42, 197, 124)";
    }
    else if (val >= 81 && val <= 150) {
        return "rgb(220, 228, 66)";
    }
    else {
        return "rgb(216, 57, 55)";
    }
}


function getColorByRange25(val) {
    if (val >= 0 && val <= 15)  {
        return "rgb(70, 90, 235)";
    }
    else if (val >= 16 && val <= 50) {
        return "rgb(42, 197, 124)";
    }
    else if (val >= 51 && val <= 100) {
        return "rgb(220, 228, 66)";
    }
    else {
        return "rgb(216, 57, 55)";
    }
}

//sliders
var margin = {
        top:50,
        right:50,
        bottom:50,
        left:50
    },
    slider_width= 800-margin.left-margin.right,
    slider_height=200-margin.bottom-margin.top;

var timeScale = d3.time.scale()
    .domain([new Date('2016-01-01'),new Date('2016-12-31')])
    .range([0,slider_width])
    .clamp(true);

var startValue = timeScale(new Date('2016-01-01'));
startingValue = formatDate(new Date('2016-01-01'));

var pm10_brush = d3.svg.brush()
    .x(timeScale)
    .extent([startingValue, startingValue])
    .on("brush", brushed10);

var pm25_brush = d3.svg.brush()
    .x(timeScale)
    .extent([startingValue, startingValue])
    .on("brush", brushed25);

pm10_svg = d3.select("#pm10")
    .append("svg")
    .attr("width", slider_width+margin.left+margin.right)
    .attr("height", slider_height+margin.top+margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left+ ","+margin.top+")");

pm10_svg.append("g")
    .attr("class","x axis")
    .attr("transform","translate(0,"+slider_height/2+")")
    .call(
        d3.svg.axis()
            .scale(timeScale)
            .orient("bottom")
            .tickFormat(function(d){return formatDate(d);})
            .tickSize(0)
            .tickPadding(12)
            .tickValues([
                timeScale.domain()[0],
                timeScale.domain()[1]]))
    .select(".domain")
    .select(function(){
        console.log(this);
        return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class","halo");

pm25_svg = d3.select("#pm25")
    .append("svg")
    .attr("width", slider_width+margin.left+margin.right)
    .attr("height", slider_height+margin.top+margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left+","+margin.top+")");

pm25_svg.append("g")
    .attr("class","x axis")
    .attr("transform","translate(0,"+slider_height/2+")")
    .call(
        d3.svg.axis()
            .scale(timeScale)
            .orient("bottom")
            .tickFormat(function(d){return formatDate(d);})
            .tickSize(0)
            .tickPadding(12)
            .tickValues([
                timeScale.domain()[0],
                timeScale.domain()[1]]))
    .select(".domain")
    .select(function(){
        console.log(this);
        return this.parentNode.appendChild(this.cloneNode(true));})
    .attr("class","halo");

var pm10_slider = pm10_svg.append("g")
    .attr("class","slider")
    .call(pm10_brush);

var pm25_slider = pm25_svg.append("g")
    .attr("class","slider")
    .call(pm25_brush);

var pm25_handle=pm25_slider.append("g")
    .attr("class","handle")

pm25_slider
    .selectAll(".extent,.resize")
    .remove();

pm25_slider.select(".background")
    .attr("height",slider_height);

pm25_handle.append("path")
    .attr("transform","translate(0,"+slider_height/2+")")
    .attr("d","M 0 -20 V 20")

pm25_handle.append('text').text(startingValue)
    .attr("transform","translate("+(-18)+" ,"+(slider_height/2-25)+")");


pm10_slider
    .selectAll(".extent,.resize")
    .remove();

pm10_slider.select(".background")
    .attr("height",slider_height);

var pm10_handle=pm10_slider.append("g")
    .attr("class","handle")

pm10_handle.append("path")
    .attr("transform","translate(0,"+slider_height/2+")")
    .attr("d","M 0 -20 V 20")

pm10_handle.append('text').text(startingValue)
    .attr("transform","translate("+(-18)+" ,"+(slider_height/2-25)+")");

pm10_slider.call(pm10_brush.event);

pm25_slider.call(pm25_brush.event);

function brushed10() {
    var value = pm10_brush.extent()[0];
    if (d3.event.sourceEvent) {
        value = timeScale.invert(d3.mouse(this)[0]);
        pm10_brush.extent([value, value]);
    }
    pm10_date = formatDateQuery(value);
    pm10_handle.attr("transform", "translate(" + timeScale(value) + ",0)");
    pm10_handle.select('text').text(formatDate(value));

    pm10_map.selectAll('path')
        .style("fill", function (d) {
            return getColorByRange10(pm10dict[pm10_date][d.properties.name]);
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .style("fill", "orange")

        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("fill", function(d) {
                    return getColorByRange10(pm10dict[pm10_date][d.properties.name]);
                })
        })

    pm10_map.selectAll('text')
        .data(features)
        .enter().append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .attr("class", "municipality-label")

        .text(function (d) {
            return d.properties.name;
        })
        .on("mouseover", function (d) {
            var tooltiptext = d.properties.name + "PM10: "+ pm10dict[pm10_date][d.properties.name]+"\n";
            d3.select(this)
                .text(tooltiptext)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .text(function(d) {
                    return d.properties.name
                })
        })
        .on("click", function(d) {
            drawPieChart10({'측정소':d.properties.name, '월':pm10_date.substring(5, 7)})
        })
}

function brushed25() {
    var value = pm25_brush.extent()[0];
    if (d3.event.sourceEvent) {
        value = timeScale.invert(d3.mouse(this)[0]);
        pm25_brush.extent([value, value]);
    }
    pm25_date = formatDateQuery(value);

    pm25_handle.attr("transform", "translate(" + timeScale(value) + ", 0)");
    pm25_handle.select("text").text(formatDate(value));

    pm25_map.selectAll('path')
        .style('fill', function (d) {
            return getColorByRange25(pm25dict[pm25_date][d.properties.name]);
        })
        .on("mouseover", function() {
            d3.select(this)
                .style("fill", "orange");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("fill", function(d) {
                    return getColorByRange25(pm25dict[pm25_date][d.properties.name]);
                })
        });
    pm25_map.selectAll('text')
        .data(features)
        .enter().append("text")
        .attr("transform", function (d) {
            return "translate(" + path.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .attr("class", "municipality-label")
        .text(function (d) {
            return d.properties.name;
        })
        .on("mouseover", function(d) {
            var tooltiptext = d.properties.name +"PM2.5: "+pm25dict[pm25_date][d.properties.name];
            d3.select(this)
                .attr("dy", ".45em")
                .text(tooltiptext)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .text(function(d) {
                    return d.properties.name
                })
        })
        .on("click", function(d) {
            drawPieChart25({'측정소':d.properties.name, '월':pm25_date.substring(5, 7)})
        });
}

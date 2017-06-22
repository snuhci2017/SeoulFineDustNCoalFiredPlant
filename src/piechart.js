var counting_10_monthly = {};
var counting_25_monthly = {};

function drawPieChart25(selected) {
    d3.csv("./csv/2016_daily.csv", function(data) {
        var placeAndMonth = selected;
        counting_25_monthly['매우나쁨'] = 0;
        counting_25_monthly['나쁨'] = 0;
        counting_25_monthly['보통'] = 0;
        counting_25_monthly['좋음'] = 0;

        data.forEach(function(d) {
            if((d.측정소 == placeAndMonth.측정소)&&(d.월 == placeAndMonth.월)) {
                if (d.PM25 > 101) counting_25_monthly['매우나쁨'] += 1;
                else if (d.PM25 >= 51 && d.PM25 <= 100) counting_25_monthly['나쁨'] += 1;
                else if (d.PM25 >= 16 && d.PM25 <= 50) counting_25_monthly['보통'] += 1;
                else if (d.PM25 >= 0 && d.PM25 <= 15) counting_25_monthly['좋음'] += 1;

            }});

        var pm25_monthly_dataset = [
            counting_25_monthly['매우나쁨'],
            counting_25_monthly['나쁨'],
            counting_25_monthly['보통'],
            counting_25_monthly['좋음']
        ];
        var w = 300;
        var h = 300;

        var outerRadius = w/2;
        var innerRadius = w/5;
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var pie = d3.layout.pie();

        var color = d3.scale.category10();

        var svg = d3.select("#25pie")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .on("click", function() {
                d3.select(this)
                    .remove();
            });

        svg.select('text')
            .attr('x', w/2)
            .attr('y', 30)
            .attr("text-anchor","middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(selected.측정소 + " " + selected.월 + "월 미세먼지 농도 단계별 일수")

        var arcs = svg.selectAll("g.arc")
            .data(pie(pm25_monthly_dataset))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius+")")


        arcs.append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc)

        arcs.append("text")
            .attr("transform", function(d) {
                return "translate("+arc.centroid(d)+")";
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.value;
            });
    })
}

function drawPieChart10(selected) {
    d3.csv("./csv/2016_daily.csv", function(data) {
        var placeAndMonth = selected;
        counting_10_monthly['매우나쁨'] = 0;
        counting_10_monthly['나쁨'] = 0;
        counting_10_monthly['보통'] = 0;
        counting_10_monthly['좋음'] = 0;

        data.forEach(function(d) {
            if((d.측정소 == placeAndMonth.측정소)&&(d.월 == placeAndMonth.월)) {
                if (d.PM10 > 151) counting_10_monthly['매우나쁨'] += 1;
                else if (d.PM10 >= 81 && d.PM10 <= 150) counting_10_monthly['나쁨'] += 1;
                else if (d.PM10 >= 31 && d.PM10 <= 80) counting_10_monthly['보통'] += 1;
                else if (d.PM10 >= 0 && d.PM10 <= 30) counting_10_monthly['좋음'] += 1;
            }});

        var pm10_monthly_dataset = [
            counting_10_monthly['매우나쁨'],
            counting_10_monthly['나쁨'],
            counting_10_monthly['보통'],
            counting_10_monthly['좋음']
        ];

        var w = 300;
        var h = 300;

        var outerRadius = w/2;
        var innerRadius = w/5;
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var pie = d3.layout.pie();

        var color = d3.scale.ordinal()
            .domain([0, 1, 2, 3])
            .range(["rgb(216, 57, 55)", "rgb(220, 228, 66)", "rgb(42, 197, 124)", "rgb(70, 90, 235)"])

        var svg = d3.select("#10pie")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .on("click", function() {
                d3.select(this)
                    .remove();
            });
        var arcs = svg.selectAll("g.arc")
            .data(pie(pm10_monthly_dataset))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + outerRadius + "," + outerRadius+")")

        arcs.append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc)

        arcs.append("text")
            .attr("transform", function(d) {
                return "translate("+arc.centroid(d)+")";
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return d.value;
            });
    })
}

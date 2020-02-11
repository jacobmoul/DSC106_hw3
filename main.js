'use strict';
var currentNode = 0;
var isPie = true;
var currentTotal = 0;
var currentNet = 0;
var currDate = 0;
var START_DATE = 0;
var END_DATE = 0;
var fullDate = true;

var areaOptions = {
    chart: {
        renderTo: 'energyChart',
        type: 'areaspline',
        backgroundColor: 'transparent'
    },
    tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
            return '<div style="background-color: #977AB1; display: inline-block; border-radius: 10px 0px 0px 10px; padding: 0px;">' + 
            Highcharts.dateFormat('%e %b. %I:%M %P', new Date(this.points[0].x)) + '</div>' + ' '  +
            '<div style="background-color: white; display: inline-block; border-radius: 0px 10px 10px 0px; padding: 0px;">' + 
            ' Total '+ Math.round(currentNet) + ' MW' + '</div>'
        },
        positioner: function () {
            return {
                // right aligned
                x: this.chart.chartWidth - this.label.width,
                y: 10 // align to title
            };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
        style: {
            fontSize: '10px'
        },
        snap: 100
    },
    title: {
        align: 'left',
        text: 'Generation MW',
        style: {
            color: "#333333", 
            fontSize: "12px"
        }
    },
    xAxis: {
        type: 'datetime',
        minorTickInterval: 1000*60*30,
        dateTimeLabelFormats: {
            // day: '%e. %b',
            month: '%b \'%y'
        },
        crosshair: {
            color: '#CA5131',
            width: 1,
            zIndex: 5
        },
        events: {
            setExtremes: syncExtremes
        },
        plotLines: [{
            dashStyle: 'Dash',
            value: 0
        }]
    },
    yAxis: {
        title: {
            enabled: false
        },
        labels: {
            formatter: function (){
                return this.value;
            },
            align: 'left',
            reserveSpace: false,
            x: 5,
            y: -3
        },
        tickInterval: 1000,
        showLastLabel: false,
        min: -300
    },
    legend: {
        enabled: false
    },
    plotOptions: {
        areaspline: {
            // stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
                lineWidth: 1,
                lineColor: '#666666'
            }
        },
        series: {
            stacking: 'normal',
            states: {
                hover: {
                    enabled: false
                }
            }
        }
    },
    series: []
};

var priceOptions = {
    chart: {
        renderTo: 'priceChart',
        type: 'line',
        backgroundColor: 'transparent'
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return '<div style="background-color: #977AB1; display: inline-block; border-radius: 10px 0px 0px 10px;">' +
            Highcharts.dateFormat('%e %b. %I:%M %P', new Date(this.point.x)) + '</div>' + ' ' + 
            '<div style="background-color: white; display: inline-block; border-radius: 0px 10px 10px 0px;">' +
            '$'+ this.point.y + '.00' + '</div>'
        },
        positioner: function () {
            return {
                // right aligned
                x: this.chart.chartWidth - this.label.width,
                y: 10 // align to title
            };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
        style: {
            fontSize: '10px'
        },
        snap: 100
    },
    plotOptions: {
        line: {
            step: 'center',
            lineWidth: 1
        },
        series: {
            states: {
                hover: {
                    enabled: false
                }
            }
        }
    },
    title: {
        align: 'left',
        text: 'Price $/MWh',
        style: {
            color: "#333333", 
            fontSize: "12px"
        }
    },
    xAxis: {
        type: 'datetime',
        tickInterval: 1000*60*30,
        dateTimeLabelFormats: {
            day: '%e. %b',
            month: '%b \'%y'
        },
        crosshair: {
            color: '#CA5131',
            width: 1
        },
        visible: false,
        events: {
            setExtremes: syncExtremes
        }
    },
    yAxis: {
        title: {
            enabled: false
        },
        labels: {
            align: 'left',
            reserveSpace: false,
            x: 5,
            y: -3
        },
        tickInterval: 100,
        showLastLabel: false,
        max: 350
    },
    legend: {
        enabled: false
    },
    series: []
};

var tempOptions = {
    chart: {
        renderTo: 'tempChart',
        type: 'spline',
        backgroundColor: 'transparent'
    },
    title: {
        align: 'left',
        text: 'Temperature °F',
        style: {
            color: "#333333", 
            fontSize: "12px"
        }
    },
    tooltip: {
        useHTML: true,
        formatter: function () {
            return '<div style="background-color: #977AB1; display: inline-block; border-radius: 10px 0px 0px 10px;">' +
            Highcharts.dateFormat('%e %b. %I:%M %P', new Date(this.point.x)) + '</div>' + ' ' +
            '<div style="background-color: white; display: inline-block; border-radius: 0px 10px 10px 0px;">' +
            this.point.y + ' °F' + '</div>'
        },
        positioner: function () {
            return {
                // right aligned
                x: this.chart.chartWidth - this.label.width,
                y: 10 // align to title
            };
        },
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
        style: {
            fontSize: '10px'
        },
        snap: 100
    },
    plotOptions: {
        spline: {
            lineWidth: 1
        },
        series: {
            states: {
                hover: {
                    enabled: false
                }
            }
        }
    },
    xAxis: {
        type: 'datetime',
        tickInterval: 1000*60*30,
        dateTimeLabelFormats: {
            day: '%e. %b',
            month: '%b \'%y'
        },
        crosshair: {
            color: '#CA5131',
            width: 1
        },
        visible: false,
        events: {
            setExtremes: syncExtremes
        }
    },
    yAxis: {
        title: {
            enabled: false
        },
        tickInterval: 20,
        maxPadding: 0.001,
        min: 0, 
        max: 100,
        labels: {
            align: 'left',
            reserveSpace: false,
            x: 5,
            y: -3
        },
        showLastLabel: false
    },
    legend: {
        enabled: false
    },
    series: []
};

var pieOptions = {
    chart: {
        renderTo: 'donutChart',
        type: 'pie',
        backgroundColor: 'transparent',
        animation: false
    },
    plotOptions: {
        pie: {
            innerSize: '50%',
            size: '100%',
            dataLabels: {
                enabled: false
            }
        },
        series: {
            animation: false
        }
    },
    title: {
        align: 'center',
        verticalAlign: 'middle',
        text: '',
        style: {
            fontSize: '13px'
        }
    },
    series: [{
        name: 'Energy',
        colorByPoint: true,
        data: []
    }]
}

var barOptions = {
    chart: {
        renderTo: 'donutChart',
        type: 'bar',
        backgroundColor: 'transparent',
        animation: false
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true,
                formatter:function() {
                    var pcnt = (this.y / currentTotal) * 100;
                    if (pcnt < 1) {
                        return pcnt.toFixed(4) + '%';
                    } else {
                        return Highcharts.numberFormat(pcnt) + '%';
                    }
                  }
            },
            borderWidth: '1'
        },
        series: {
            animation: false,
            pointPadding: 0.1,
            groupPadding: 0,
        }
    },
    title: {
        text: ''
    },
    yAxis: {
        visible: false
    },
    xAxis: {
        categories: []
    },
    legend: {
        enabled: false
    },
    series: [{
        name: 'Energy',
        colorByPoint: true,
        data: []
    }]
}

var colorsMap = {
    'black_coal': '#121212', 
    'distillate': '#C74523', 
    'gas_ccgt': '#FDB462',
    'hydro': '#4582B4',
    'wind': '#437607',
    'exports': '#121212', /*'#44146F',*/
    'pumps': '#121212'/*'#88AFD0'*/
};

var nameMap = {
    'black_coal': 'Black Coal', 
    'distillate': 'Distillate', 
    'gas_ccgt': 'Gas (CCGT)',
    'hydro': 'Hydro',
    'wind': 'Wind',
    'exports': 'Exports',
    'pumps': 'Pumps'
}

var globalEnergyData = {
    name: [],
    data: []
}

var globalLoadData = {
    name: [],
    data: []
}

var globalPriceData = {
    data: []
}


var jsonData = new Array();

/**
 * Load data and render charts.
 * @param {json file path} filePath 
 * @param {chart render function} callback 
 */
function loadAndRenderData(filePath, callback) {
    $.getJSON(filePath , function(data) {
        var length = data.length
        for (var i = 0; i < length; i++) {
            jsonData.push(data[i])
        }
        callback(jsonData);
    })
}

/**
 * Updates global Price Data energy structure for the legend.
 * @param {*} data 
 */
function updatePriceData(data) {
    globalPriceData.data = [];
    for (var idx = 0; idx < data[0]['data'].length; idx ++) {
        var priceBreakup = data.map(elm => {return elm['data'][idx]});
        globalPriceData['data'].push(priceBreakup);
    }
}

/**
 * Updates global Energy Data energy structure for the legend.
 * @param {*} data 
 */
function updateEnergyData(data) {
    data = data.filter(function(elm) {
        return (elm.name !== 'pumps' & elm.name !== 'exports')
    })
    globalEnergyData.data = [];
    for (var idx = 0; idx < data[0]['data'].length; idx ++) {
        var energyBreakup = data.map(elm => {return elm['data'][idx]});
        globalEnergyData['data'].push(energyBreakup);
    }
    globalEnergyData['name'] = data.map(elm => elm['name']);
}

function setCurrentDate(nodeId, fullRange) {
    currDate = START_DATE + ((1000 * 60 * 30) * nodeId);
    var cell = document.querySelector('#date');
    if (fullRange) {
        var front = Highcharts.dateFormat('%e %b. %I:%M %P', new Date(START_DATE));
        var back = Highcharts.dateFormat('%e %b. %I:%M %P', new Date(END_DATE));
        var text = front + ' - ' + back;
        cell.innerHTML = text;
    } else {
        var text = Highcharts.dateFormat('%e %b. %I:%M %P', new Date(currDate));
        cell.innerHTML = text;
    }
}

/**
 * Updates global Load Data energy structure for the legend.
 * @param {*} data 
 */
function updateLoadData(data) {
    data = data.filter(function(elm) {
        return (elm.name === 'pumps' | elm.name === 'exports')
    })
    globalLoadData.data = [];
    for (var idx = 0; idx < data[0]['data'].length; idx ++) {
        var energyBreakup = data.map(elm => {return elm['data'][idx]});
        globalLoadData['data'].push(energyBreakup);
    }
    globalLoadData['name'] = data.map(elm => elm['name']);
}

/**
 * Renders a bar or pie chart depending on value of isPie.
 * @param {current mouseover index} nodeId 
 */
function renderBarOrPieChart(nodeId) {
    var data = globalEnergyData['name'].map(function(elm, idx) {
        return {
            name: elm.split('.')[elm.split('.').length - 1],
            y: globalEnergyData['data'][nodeId][idx],
            color: colorsMap[elm.split('.')[elm.split('.').length - 1]]
        }
    });
    var names = [];
    for (var i = 0; i < data.length; i++) {
        names.push(nameMap[data[i].name]);
    }
    var total = 0;
    for (var i = 0; i < data.length; i++) {
        total = total + data[i].y
    }
    currentTotal = total;
    pieOptions.title.text = Math.round(total) + ' MW';

    if (isPie) {
        pieOptions.series[0].data = data.reverse();
        Highcharts.chart(pieOptions);
    } else {
        barOptions.series[0].data = data.reverse();
        barOptions.xAxis.categories = names;
        Highcharts.chart(barOptions);
    }
};


/**
 * Extract the energy data from the json data.
 * @param {json data object} jsonData 
 */
function extractEnergyData(jsonData) {
    var energyData = jsonData.filter(function(elm) {
        if (elm.fuel_tech !== 'rooftop_solar'){
            return elm['type'] === 'power';
        };
    }).map(function(elm) {
        var energyVals = new Array();
        var stackName;
        if (elm.fuel_tech === 'pumps' || elm.fuel_tech === 'exports') {
            for (var i = 1; i < elm.history.data.length; i = i+6) {
                energyVals.push(elm.history.data[i]*(-1));
            };
            stackName = 'neg';
        } else {
            for (var i = 1; i < elm.history.data.length; i = i+6) {
                energyVals.push(elm.history.data[i]);
            };
            stackName = 'pos';
        }
        return {
            data: energyVals,
            name: elm.fuel_tech,
            pointStart: (elm.history.start + 5*60) * 1000,
            pointInterval: 1000 * 60 * 30,
            color: colorsMap[elm.fuel_tech],
            fillOpacity: 1,
            stack: stackName,
            tooltip: {
                valueSuffix: ' ' + elm.units
            }
        };
    });
    START_DATE = energyData[0].pointStart;
    END_DATE = START_DATE + (1000 * 60 * 30 * 336);
    console.log(energyData);
    return energyData;
};

/**
 * Extract the price data from the json data.
 * @param {json data object} jsonData 
 */
function extractPriceData(jsonData) {
    var priceData = jsonData.filter(function(elm) {
        return elm.type === 'price';
    }).map(function(elm) {
        var priceVals = new Array();
        for (var i = 1; i < elm.history.data.length; i++) {
            priceVals.push(elm.history.data[i]);
        };
        return {
            data: priceVals,
            name: elm.type,
            pointStart: (elm.history.start + 30*60) * 1000,
            pointInterval: 1000 * 60 * 30,
            color: 'Red',
            tooltip: {
                valueSuffix: ' ' + elm.units
            }
        };
    });
    return priceData;
}

/**
 * Extract the temp data from the json data.
 * @param {json data object} jsonData 
 */
function extractTempData(jsonData) {
    var tempData = jsonData.filter(function(elm) {
        return elm.type === 'temperature';
    }).map(function(elm) {
        var tempVals = new Array();
        for (var i = 1; i < elm.history.data.length; i++) {
            tempVals.push(elm.history.data[i]);
        };
        return {
            data: tempVals,
            name: elm.type,
            pointStart: (elm.history.start + 30*60) * 1000,
            pointInterval: 1000 * 60 * 30,
            color: 'Red',
            tooltip: {
                valueSuffix: ' ' + elm.units
            }
        };
    });
    return tempData;
}

function onSuccessCb(jsonData) {
    var energyData = extractEnergyData(jsonData);
    updateEnergyData(energyData)
    updateLoadData(energyData)
    var tempData = extractTempData(jsonData);
    var priceData = extractPriceData(jsonData);
    updatePriceData(priceData);
    areaOptions.series = energyData.reverse();
    priceOptions.series = priceData;
    tempOptions.series = tempData;
    Highcharts.chart(tempOptions);
    Highcharts.chart(priceOptions);
    Highcharts.chart(areaOptions);
    renderBarOrPieChart(currentNode);
    setCurrentDate(currentNode, fullDate);
    fillAvValueCol('full');
}


/**
 * Define dashboard behavior for mouse out of chart area.
 */
['mouseleave'].forEach(function (eventType) {
    document.getElementById('sharedGrid').addEventListener(
        eventType,
        function (e) {
            var chart,
                point,
                i,
                event;

                fullDate = true;
            
                for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                    chart = Highcharts.charts[i];
                    if (chart) {
                        event = chart.pointer.normalize(e);
                        point = chart.series[0].searchPoint(event, true);
                        
                        if (point) {
                            point.onMouseOut(); 
                            chart.tooltip.hide(point);
                            chart.xAxis[0].hideCrosshair(); 
                            fillAvValueCol('full');
                            setCurrentDate(currentNode, fullDate);
                        }
                    }
                }
            }
    )
});

/**
 * Define dashboard behavior for mouse over chart area.
 */
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document.getElementById('sharedGrid').addEventListener(
        eventType,
        function (e) {
            var chart,
                point,
                i,
                event,
                idx;

            fullDate = false;

            for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                chart = Highcharts.charts[i];
                // Find coordinates within the chart
                if (chart) {
                    event = chart.pointer.normalize(e);
                    // Get the hovered point
                    point = chart.series[0].searchPoint(event, true);
                    idx = chart.series[0].data.indexOf( point );
                    currentNode = idx;

                    if (point) {
                        point.highlight(e);
                        renderBarOrPieChart(idx);
                        updateLegend(idx, currentTotal);
                    }
                }
            }
        }
    );
});

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.onMouseOver(); // Show the hover marker
    this.series.chart.tooltip.refresh(this); // Show the tooltip
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    this.series.chart.yAxis[0].drawCrosshair(event, this);
};


/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        { trigger: 'syncExtremes' }
                    );
                }
            }
        });
    }
}

var pricesMap = {
    'sources': '$58.62',
    'wind': '$56.43',
    'hydro': '$63.96',
    'gas_ccgt': '$60.22',
    'distillate': '$57.42',
    'black_coal': '$59.01',
    'exports': '$65.36',
    'pumps': '$46.49'
}

function fillAvValueCol(status, total='-') {
    for (var energy in pricesMap) {
        if (pricesMap.hasOwnProperty(energy)) {
            var name = '#' + energy;
            var priceCell = document.querySelector(name).querySelector('.cell-price');
            if (status === 'empty') {
                if (energy === 'sources') {
                    priceCell.innerHTML = total;
                } else {
                    priceCell.innerHTML = '-';
                }
            } else { // status is filled
                priceCell.innerHTML = pricesMap[energy];
            }
        }
    }
}

/**
 * Update legend.
 * @param {current mouse over index} nodeId 
 * @param {energy total associated with this nodeId} grandTotal 
 */
function updateLegend(nodeId, grandTotal) {
    setCurrentDate(nodeId, fullDate);
    var energyData = globalEnergyData['name'].map(function(elm, idx) {
        return {
            name: elm.split('.')[elm.split('.').length - 1],
            y: globalEnergyData['data'][nodeId][idx],
            color: colorsMap[elm.split('.')[elm.split('.').length - 1]]
        }
    });
    var loadData = globalLoadData['name'].map(function(elm, idx) {
        return {
            name: elm.split('.')[elm.split('.').length - 1],
            y: globalLoadData['data'][nodeId][idx],
            color: colorsMap[elm.split('.')[elm.split('.').length - 1]]
        }
    });
    var sourcesCell = document.querySelector('#sources').querySelector('.cell-total');
    sourcesCell.innerHTML = Math.round(grandTotal);
    var loadsCell = document.querySelector('#loads').querySelector('.cell-total');
    for(var i = 0; i < energyData.length; i++) {
        var name = '#' + energyData[i].name;
        var cellTotal = document.querySelector(name).querySelector('.cell-total');
        var cellPercent = document.querySelector(name).querySelector('.cell-percent');
        var per = (100*(energyData[i].y / grandTotal));
        cellPercent.innerHTML = per;
        if (energyData[i].y < 1) {
            cellTotal.innerHTML = energyData[i].y.toFixed(2);
        } else {
            cellTotal.innerHTML = Math.round(energyData[i].y);
        }
        if (per < 1) {
            cellPercent.innerHTML = per.toFixed(4)+'%';
        } else {
            cellPercent.innerHTML = per.toFixed(2)+'%';
        }
    }
    var loadTotal = 0;
    for(var i = 0; i < loadData.length; i++) {
        var name = '#' + loadData[i].name;
        var cellTotal = document.querySelector(name).querySelector('.cell-total');
        var cellPercent = document.querySelector(name).querySelector('.cell-percent');
        var per = (100*(loadData[i].y / grandTotal));
        cellPercent.innerHTML = per;
        loadTotal = loadTotal + loadData[i].y;
        if (loadData[i].y === 0) {
            cellTotal.innerHTML = '-';
        } else {
            if (loadData[i].y < 1) {
                cellTotal.innerHTML = loadData[i].y.toFixed(2);
            } else {
                cellTotal.innerHTML = Math.round(loadData[i].y);
            }
        }
        if (per === 0) {
            cellPercent.innerHTML = '-';
        } else {
            cellPercent.innerHTML = per.toFixed(2)+'%';
        }
    }
    if (loadTotal === 0) {
        loadsCell.innerHTML = '-';
    } else {
        loadsCell.innerHTML = Math.round(loadTotal);
    }

    var net = grandTotal + loadTotal;
    currentNet = net;
    var netCell = document.querySelector('#net').querySelector('.cell-total');
    netCell.innerHTML = Math.round(net);

    var hydroCell = document.querySelector('#hydro').querySelector('.cell-total');
    var windCell = document.querySelector('#wind').querySelector('.cell-total');
    var renewCell = document.querySelector('#renewables').querySelector('.cell-percent');
    renewCell.innerHTML = ((100*(Number(windCell.innerHTML) + Number(hydroCell.innerHTML)))/grandTotal).toFixed(2)+'%';

    var priceCell = document.querySelector('#sources').querySelector('.cell-price');
    var totalPrice =  '$' + Number(globalPriceData.data[nodeId]).toFixed(2);
    fillAvValueCol('empty', totalPrice);
;}

function togglePie() {
    isPie = true;
    renderBarOrPieChart(currentNode);
    document.querySelector('#pieButton').className = 'btn active';
    document.querySelector('#barButton').className = 'btn';
};

function toggleBar() {
    isPie = false;
    renderBarOrPieChart(currentNode);
    document.querySelector('#pieButton').className = 'btn';
    document.querySelector('#barButton').className = 'btn active';
};
document.onload = loadAndRenderData('assets/springfield_converted_json.js', onSuccessCb);
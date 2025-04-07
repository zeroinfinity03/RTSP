const chartConfig = {
    chart: {
        type: 'line',
        backgroundColor: '#f4f4f4'
    },
    xAxis: {
        type: 'datetime',
        labels: {
            format: '{value:%Y-%m-%d}'
        }
    },
    yAxis: {
        title: { text: null },
        gridLineColor: '#e6e6e6'
    },
    tooltip: {
        shared: true,
        crosshairs: true
    },
    plotOptions: {
        series: {
            marker: {
                enabled: true,
                radius: 3
            }
        }
    }
};

async function updateCharts(symbol, period) {
    try {
        const [historicalResponse, predictionResponse] = await Promise.all([
            fetch(`/api/stock/${symbol}?period=${period}`),
            fetch(`/api/stock/${symbol}/predict?period=${period}`)
        ]);

        const historicalData = await historicalResponse.json();
        const predictionData = await predictionResponse.json();

        console.log('Historical data:', historicalData);
        console.log('Prediction data received:', predictionData); // Debug log

        // Historical Chart (top)
        Highcharts.stockChart('historical-chart', {
            ...chartConfig,
            title: { text: `${symbol} Historical Price` },
            xAxis: {
                ...chartConfig.xAxis,
                categories: historicalData.dates
            },
            yAxis: [{
                ...chartConfig.yAxis,
                title: { text: 'Price ($)' }
            }, {
                title: { text: 'Volume' },
                opposite: true
            }],
            series: [{
                type: 'candlestick',
                name: symbol,
                data: historicalData.ohlc
            }, {
                type: 'column',
                name: 'Volume',
                data: historicalData.volume,
                yAxis: 1
            }]
        });

        // Prediction Chart (bottom)
        const predictionChart = {
            chart: {
                height: 400,  // Make chart taller
                type: 'line',
                backgroundColor: '#f8f9fa'
            },
            title: {
                text: `${symbol} Price Prediction (${getPeriodText(period)})`,
                style: { fontSize: '16px' }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    format: '{value:%Y-%m-%d}'
                }
            },
            yAxis: {
                title: { text: 'Price ($)' },
                labels: { formatter: function() { return '$' + this.value.toFixed(2); } }
            },
            series: [{
                name: 'Predicted Price',
                data: predictionData.dates.map((date, i) => [
                    Date.parse(date),
                    predictionData.predicted_prices[i]
                ]),
                color: '#2196F3',
                zIndex: 2
            }, {
                name: 'Confidence Range',
                type: 'arearange',
                data: predictionData.dates.map((date, i) => [
                    Date.parse(date),
                    predictionData.lower_bound[i],
                    predictionData.upper_bound[i]
                ]),
                color: '#90CAF9',
                fillOpacity: 0.3,
                lineWidth: 0,
                zIndex: 1
            }]
        };
        
        Highcharts.chart('prediction-chart', predictionChart);

    } catch (error) {
        console.error('Error updating charts:', error);
        document.getElementById('prediction-chart').innerHTML = 
            '<div class="alert alert-danger">Failed to load prediction data. Please try again.</div>';
    }
}

function getPeriodText(period) {
    const map = {
        '1w': 'Week',
        '1mo': 'Month',
        '3mo': '3 Months',
        '6mo': '6 Months'
    };
    return map[period] || 'Month';
}

function getPeriodFormat(period) {
    const map = {
        '1w': '{value:%H:%M}',
        '1mo': '{value:%m-%d}',
        '3mo': '{value:%m-%d}',
        '6mo': '{value:%Y-%m-%d}'
    };
    return map[period] || '{value:%Y-%m-%d}';
}

function getPeriodTooltipFormat(period) {
    const map = {
        '1w': '%Y-%m-%d %H:%M',
        '1mo': '%Y-%m-%d %H:%M',
        '3mo': '%Y-%m-%d %H:%M',
        '6mo': '%Y-%m-%d'
    };
    return map[period] || '%Y-%m-%d';
}

// Update period selection handler
document.getElementById('period-select').addEventListener('change', function() {
    const symbol = document.getElementById('symbol-select').value;
    const period = this.value;
    updateCharts(symbol, period);
});
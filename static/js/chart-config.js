const chartConfig = {
    colors: ['#2196F3', '#4CAF50', '#FFC107', '#FF5722'],
    chart: {
        backgroundColor: '#f8f9fa',
        style: {
            fontFamily: 'Inter, -apple-system, system-ui, sans-serif'
        },
        borderRadius: 8,
        spacing: [20, 20, 20, 20]
    },
    title: {
        style: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a237e'
        }
    },
    xAxis: {
        labels: {
            style: {
                color: '#546e7a',
                fontSize: '12px'
            }
        },
        lineColor: '#eceff1',
        tickColor: '#eceff1'
    },
    yAxis: {
        gridLineColor: '#eceff1',
        labels: {
            style: {
                color: '#546e7a',
                fontSize: '12px'
            }
        },
        title: {
            style: {
                color: '#546e7a',
                fontSize: '13px',
                fontWeight: '500'
            }
        }
    },
    tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 0,
        borderRadius: 4,
        shadow: true,
        style: {
            fontSize: '12px'
        }
    },
    legend: {
        itemStyle: {
            fontWeight: '500',
            fontSize: '12px'
        }
    },
    plotOptions: {
        series: {
            animation: {
                duration: 1000
            },
            marker: {
                enabled: false
            }
        }
    }
};

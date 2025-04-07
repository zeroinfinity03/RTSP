document.addEventListener('DOMContentLoaded', function() {
    const stockSelect = document.getElementById('stockSelect');
    const timeSelect = document.getElementById('timeSelect');
    
    // Initialize charts with empty data
    let historicalChart = null;
    let predictionChart = null;
    let sentimentChart = null;

    console.log('Initializing charts...');
    initializeCharts();
    
    // Load initial data if a stock is selected
    if (stockSelect.value) {
        console.log('Initial stock selected:', stockSelect.value);
        updateCharts();
    }
    
    // Add event listeners
    stockSelect.addEventListener('change', () => {
        console.log('Stock selected:', stockSelect.value);
        updateCharts();
    });
    timeSelect.addEventListener('change', () => {
        console.log('Time period selected:', timeSelect.value);
        updateCharts();
    });
    
    function initializeCharts() {
        // Historical Chart (Top)
        historicalChart = Highcharts.stockChart('historical-chart', {
            accessibility: {
                enabled: true,
                description: 'Stock price history chart showing OHLC prices and volume'
            },
            chart: {
                backgroundColor: '#1f2937',
                events: {
                    load: function() {
                        console.log('Historical chart loaded');
                    }
                }
            },
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: true,
                height: 30,
                margin: 20,
                series: {
                    color: '#60a5fa',
                    lineWidth: 1
                },
                maskFill: 'rgba(96, 165, 250, 0.2)',
                outlineColor: '#374151',
                handles: {
                    backgroundColor: '#60a5fa',
                    borderColor: '#374151'
                }
            },
            scrollbar: {
                enabled: false
            },
            yAxis: [{
                labels: {
                    align: 'right',
                    style: { color: '#fff' }
                },
                title: {
                    text: 'Price',
                    style: { color: '#fff' }
                },
                height: '60%',
                lineWidth: 2,
                resize: { enabled: true }
            }, {
                labels: {
                    align: 'right',
                    style: { color: '#fff' }
                },
                title: {
                    text: 'Volume',
                    style: { color: '#fff' }
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],
            tooltip: {
                split: true
            },
            series: [{
                type: 'candlestick',
                name: 'Stock Price',
                data: [],
                color: '#ef4444',
                upColor: '#22c55e'
            }, {
                type: 'column',
                name: 'Volume',
                data: [],
                yAxis: 1,
                color: '#60a5fa'
            }],
            title: {
                text: 'Historical Price Data',
                style: { color: '#fff' }
            }
        });

        // Prediction Chart (Middle)
        predictionChart = Highcharts.chart('prediction-chart', {
            accessibility: {
                enabled: true,
                description: 'Stock price prediction chart showing predicted prices and confidence intervals'
            },
            chart: {
                type: 'line',
                backgroundColor: '#1f2937',
                events: {
                    load: function() {
                        console.log('Prediction chart loaded');
                    }
                }
            },
            title: {
                text: 'Price Prediction',
                style: { color: '#fff' }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: { color: '#fff' }
                }
            },
            yAxis: {
                title: {
                    text: 'Price ($)',
                    style: { color: '#fff' }
                },
                labels: {
                    style: { color: '#fff' }
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true
            },
            series: [{
                name: 'Predicted Price',
                data: [],
                color: '#2196F3',
                zIndex: 2
            }, {
                name: 'Confidence Range',
                type: 'arearange',
                data: [],
                fillOpacity: 0.3,
                color: 'rgba(33, 150, 243, 0.3)',
                lineWidth: 0,
                zIndex: 1
            }],
            legend: {
                itemStyle: { color: '#fff' }
            }
        });

        // Sentiment Chart (Bottom)
        sentimentChart = Highcharts.chart('sentiment-chart', {
            chart: {
                type: 'line',
                backgroundColor: '#1f2937',
                events: {
                    click: function(e) {
                        // Show news details on click
                        const points = this.series[0].points;
                        const clickedPoint = points.find(p => 
                            Math.abs(p.x - e.xAxis[0].value) < 24 * 3600 * 1000 // within 24 hours
                        );
                        if (clickedPoint && clickedPoint.articleDetails) {
                            showNewsDetails(clickedPoint.articleDetails);
                        }
                    }
                }
            },
            title: {
                text: 'Market Sentiment Analysis with News',
                style: { color: '#fff' }
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    style: { color: '#fff' }
                }
            },
            yAxis: [{
                title: {
                    text: 'Sentiment Score',
                    style: { color: '#fff' }
                },
                min: 0,
                max: 1,
                labels: {
                    style: { color: '#fff' }
                },
                gridLineColor: '#374151'
            }],
            tooltip: {
                shared: true,
                useHTML: true,
                formatter: function() {
                    const point = this.points[0];
                    let tooltipContent = `<b>${Highcharts.dateFormat('%Y-%m-%d', point.x)}</b><br/>`;
                    tooltipContent += `Sentiment: <b>${point.y.toFixed(3)}</b><br/>`;
                    if (point.point.articleDetails) {
                        tooltipContent += `<br/><b>News:</b> ${point.point.articleDetails.title}<br/>`;
                        tooltipContent += `<small>Click for more details</small>`;
                    }
                    return tooltipContent;
                }
            },
            series: [{
                name: 'News Sentiment',
                data: [],
                color: '#60a5fa',
                marker: {
                    enabled: true,
                    radius: 4
                }
            }],
            legend: {
                itemStyle: { color: '#fff' }
            }
        });
    }

    async function updateCharts() {
        const symbol = stockSelect.value;
        const period = timeSelect.value;
        
        if (!symbol) {
            console.log('No symbol selected');
            return;
        }
        
        try {
            console.log('Fetching data for:', symbol, period);
            
            // Fetch all data in parallel
            const [detailsResponse, historicalResponse, predictionResponse, sentimentResponse] = await Promise.all([
                fetch(`/api/stock/${symbol}/details`),
                fetch(`/api/stock/${symbol}?period=${period}`),
                fetch(`/api/stock/${symbol}/predict?period=${period}`),
                fetch(`/api/stock/${symbol}/sentiment`)
            ]);

            const [details, historicalData, predictionData, sentimentData] = await Promise.all([
                detailsResponse.json(),
                historicalResponse.json(),
                predictionResponse.json(),
                sentimentResponse.json()
            ]);

            console.log('Historical data received:', historicalData);
            console.log('Prediction data received:', predictionData);
            console.log('Sentiment data received:', sentimentData);

            // Update stock details
            updateStockDetails(details);
            updateSentimentSection(sentimentData);

            // Update historical chart (top)
            if (historicalData.ohlc && historicalData.ohlc.length > 0) {
                console.log('Updating historical chart with', historicalData.ohlc.length, 'data points');
                historicalChart.series[0].setData(historicalData.ohlc, false);
                historicalChart.series[1].setData(historicalData.volume, true);
                historicalChart.setTitle({ text: `${symbol} Historical Price`, style: { color: '#fff' } });
            }

            // Update prediction chart (middle)
            if (predictionData.dates && predictionData.dates.length > 0) {
                console.log('Updating prediction chart with', predictionData.dates.length, 'data points');
                const predictedPrices = predictionData.dates.map((date, i) => [
                    new Date(date).getTime(),
                    predictionData.predicted_prices[i]
                ]);
                
                const confidenceRange = predictionData.dates.map((date, i) => [
                    new Date(date).getTime(),
                    predictionData.lower_bound[i],
                    predictionData.upper_bound[i]
                ]);

                predictionChart.series[0].setData(predictedPrices, false);
                predictionChart.series[1].setData(confidenceRange, true);
                predictionChart.setTitle({ 
                    text: `${symbol} Price Prediction (${period.toUpperCase()})`,
                    style: { color: '#fff' }
                });
            }

            // Update sentiment chart (bottom)
            if (sentimentData.articles && sentimentData.articles.length > 0) {
                console.log('Updating sentiment chart with', sentimentData.articles.length, 'data points');
                const sentimentPoints = sentimentData.articles.map(article => ({
                    x: new Date(article.published_date || Date.now()).getTime(),
                    y: article.combined_sentiment_score,
                    articleDetails: article
                })).sort((a, b) => a.x - b.x);

                sentimentChart.series[0].setData(sentimentPoints);
                sentimentChart.setTitle({ 
                    text: `${symbol} Market Sentiment Analysis with News`,
                    style: { color: '#fff' }
                });
            }

        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    function updateSentimentSection(sentimentData) {
        // Update overall sentiment
        const overallSentiment = document.getElementById('overallSentiment');
        const sentimentScore = document.getElementById('sentimentScore');
        const latestNewsSentiment = document.getElementById('latestNewsSentiment');
        
        // Set sentiment color based on value
        const sentimentColor = getSentimentColor(sentimentData.sentiment_score);
        overallSentiment.textContent = sentimentData.overall_sentiment.toUpperCase();
        overallSentiment.style.color = sentimentColor;
        
        sentimentScore.textContent = sentimentData.sentiment_score.toFixed(2);
        
        // Update news sentiment section
        latestNewsSentiment.innerHTML = ''; // Clear existing content
        
        // Display all news items, sorted by date
        const sortedArticles = sentimentData.articles
            .sort((a, b) => new Date(b.published_date) - new Date(a.published_date));

        sortedArticles.forEach((article, index) => {
            const newsItem = document.createElement('div');
            newsItem.className = 'p-2 rounded bg-gray-600 mb-2 hover:bg-gray-500 transition-colors';
            
            const titleContainer = document.createElement('div');
            titleContainer.className = 'flex items-start justify-between gap-2';
            
            const title = document.createElement('a');
            title.href = article.url;
            title.target = '_blank';
            title.className = 'text-blue-300 hover:text-blue-200 flex-1';
            title.textContent = `${index + 1}. ${article.title}`;
            
            const date = document.createElement('span');
            date.className = 'text-xs text-gray-400 whitespace-nowrap';
            date.textContent = new Date(article.published_date).toLocaleDateString();
            
            titleContainer.appendChild(title);
            titleContainer.appendChild(date);
            
            const sentimentContainer = document.createElement('div');
            sentimentContainer.className = 'flex justify-between items-center mt-1 text-sm';
            
            const titleSentiment = document.createElement('span');
            titleSentiment.textContent = `Title: ${article.title_sentiment.sentiment} (${article.title_sentiment.score.toFixed(2)})`;
            titleSentiment.style.color = getSentimentColor(article.title_sentiment.score);
            
            const contentSentiment = document.createElement('span');
            contentSentiment.textContent = `Content: ${article.content_sentiment.sentiment} (${article.content_sentiment.score.toFixed(2)})`;
            contentSentiment.style.color = getSentimentColor(article.content_sentiment.score);
            
            sentimentContainer.appendChild(titleSentiment);
            sentimentContainer.appendChild(contentSentiment);
            
            newsItem.appendChild(titleContainer);
            newsItem.appendChild(sentimentContainer);
            latestNewsSentiment.appendChild(newsItem);
        });
    }

    function getSentimentColor(score) {
        if (score >= 0.6) return '#22c55e'; // green-500
        if (score <= 0.4) return '#ef4444'; // red-500
        return '#eab308'; // yellow-500
    }

    function updateStockDetails(details) {
        document.getElementById('companyName').textContent = details.name || '-';
        document.getElementById('currentPrice').textContent = formatNumber(details.current_price, 'currency');
        document.getElementById('volume').textContent = formatNumber(details.volume);
        document.getElementById('avgVolume').textContent = formatNumber(details.avg_volume);
        document.getElementById('high52').textContent = formatNumber(details.fifty_two_week_high, 'currency');
        document.getElementById('low52').textContent = formatNumber(details.fifty_two_week_low, 'currency');
        document.getElementById('marketCap').textContent = formatMarketCap(details.market_cap);
        document.getElementById('peRatio').textContent = details.pe_ratio ? details.pe_ratio.toFixed(2) : '-';
    }

    function formatNumber(num, type = 'number') {
        if (!num) return '-';
        if (type === 'currency') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
        }
        return new Intl.NumberFormat('en-US').format(num);
    }

    function formatMarketCap(num) {
        if (!num) return '-';
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toFixed(2)}`;
    }

    function showNewsDetails(article) {
        // Create modal for news details
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h3 class="text-xl font-bold mb-4 text-white">${article.title}</h3>
                <div class="space-y-4">
                    <div class="bg-gray-700 p-4 rounded">
                        <p class="text-sm text-white mb-2">
                            <span class="font-semibold">Source:</span> ${article.source}
                        </p>
                        <p class="text-sm text-white mb-2">
                            <span class="font-semibold">Date:</span> ${new Date(article.published_date).toLocaleString()}
                        </p>
                        <p class="text-sm text-white mb-2">
                            <span class="font-semibold">Title Sentiment:</span> 
                            <span style="color: ${getSentimentColor(article.title_sentiment.score)}">
                                ${article.title_sentiment.sentiment} (${article.title_sentiment.score.toFixed(2)})
                            </span>
                        </p>
                        <p class="text-sm text-white">
                            <span class="font-semibold">Content Sentiment:</span>
                            <span style="color: ${getSentimentColor(article.content_sentiment.score)}">
                                ${article.content_sentiment.sentiment} (${article.content_sentiment.score.toFixed(2)})
                            </span>
                        </p>
                    </div>
                    <a href="${article.url}" target="_blank" 
                       class="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        Read Full Article
                    </a>
                </div>
                <button class="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add click handler to close modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('button')) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }
});

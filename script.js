const API_KEY = "XzHchY_r5rOtIvJ4lm8Ay3WlmFDUuj3K"; 
const portfolio = [];
const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"]; 
let stockChart;

async function fetchStockData(symbol) {
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function fetchHistoricalData(symbol) {
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/2023-01-01/2023-10-01?adjusted=true&apiKey=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function displayPopularStocks() {
  const popularStocksContainer = document.getElementById("popular-stocks-container");

  for (const symbol of popularStocks) {
    const stockData = await fetchStockData(symbol);
    if (stockData.status === "ERROR" || !stockData.results) continue;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="symbol">${stockData.ticker}</div>
      <div class="price">$${stockData.results[0].c.toFixed(2)}</div>
    `;

    popularStocksContainer.appendChild(card);
  }
}

document.getElementById("add-stock").addEventListener("click", async () => {
  const symbol = document.getElementById("stock-symbol").value.toUpperCase();
  if (!symbol) return alert("Please enter a stock symbol.");

  try {
    const data = await fetchStockData(symbol);
    if (data.status === "ERROR" || !data.results) {
      alert("Invalid stock symbol or API error.");
      return;
    }

    const stock = {
      symbol: data.ticker,
      price: data.results[0].c,
    };

    portfolio.push(stock);
    updatePortfolio();
    updateChart();
  } catch (error) {
    console.error("Error fetching stock data:", error);
    alert("Failed to fetch stock data.");
  }
});

function updatePortfolio() {
  const portfolioList = document.getElementById("portfolio");
  portfolioList.innerHTML = portfolio
    .map(
      (stock) => `
      <li>
        ${stock.symbol} - $${stock.price.toFixed(2)}
        <button onclick="removeStock('${stock.symbol}')">Remove</button>
      </li>
    `
    )
    .join("");
}

function removeStock(symbol) {
  const index = portfolio.findIndex((stock) => stock.symbol === symbol);
  portfolio.splice(index, 1);
  updatePortfolio();
  updateChart();
}

async function updateChart() {
  const ctx = document.getElementById("stockChart").getContext("2d");
  if (stockChart) stockChart.destroy();

  if (portfolio.length === 0) return;

  const historicalData = await fetchHistoricalData(portfolio[0].symbol);
  if (!historicalData.results) return;

  const labels = historicalData.results.map((result) => new Date(result.t).toLocaleDateString());
  const datasets = portfolio.map((stock) => ({
    label: stock.symbol,
    data: historicalData.results.map((result) => result.c),
    borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    fill: false,
  }));

  stockChart = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: { responsive: true },
  });
}

displayPopularStocks();
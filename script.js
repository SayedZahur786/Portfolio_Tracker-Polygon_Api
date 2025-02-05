const API_KEY = "XzHchY_r5rOtIvJ4lm8Ay3WlmFDUuj3K";
const portfolio = [];

function getTwoDaysBeforeDate() {
    const today = new Date();
    const twoDaysBefore = new Date(today.setDate(today.getDate() - 2));
    return twoDaysBefore.toISOString().split("T")[0]; 
}

async function fetchStockData(symbol) {
    const date = getTwoDaysBeforeDate(); 
    const url = `https://api.polygon.io/v1/open-close/${symbol}/${date}?adjusted=true&apiKey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching stock data:", error.message);
        alert("Failed to fetch stock data. Please check your API key and try again.");
        return null;
    }
}

async function addStockToPortfolio(symbol) {
    try {
        const data = await fetchStockData(symbol);
        if (!data || data.status === "ERROR") {
            alert("Invalid stock symbol or API error.");
            return;
        }

        const stock = {
            symbol: data.symbol,
            open: data.open,
            close: data.close,
            high: data.high,
            low: data.low,
        };

        if (!portfolio.some((item) => item.symbol === stock.symbol)) {
            portfolio.push(stock);
            updatePortfolio();
            updateStockPerformance();
        } else {
            alert("Stock already exists in the portfolio.");
        }
    } catch (error) {
        console.error("Error adding stock to portfolio:", error);
        alert("Failed to add stock to portfolio. Please try again.");
    }
}

function updatePortfolio() {
  const portfolioList = document.getElementById("portfolio");
  portfolioList.innerHTML = portfolio
      .map(
          (stock) => `
    <li>
      ${stock.symbol} - Open: $${stock.open.toFixed(2)} | Close: $${stock.close.toFixed(2)}
      <button onclick="removeStock('${stock.symbol}')">Remove</button>
    </li>
  `
      )
      .join("");

  const totalWorth = portfolio.reduce((sum, stock) => sum + stock.close, 0).toFixed(2);
  document.getElementById("total-worth-value").textContent = totalWorth;

  const commentElement = document.getElementById("total-worth-comment");
  if (totalWorth === "0.00") {
      commentElement.textContent = "The market is waiting for you, legend! Enter and BOOM it!";
  } else if (totalWorth > 0 && totalWorth <= 200) {
      commentElement.textContent = "You are an experienced trader! Please publish your tips.";
  } 
  else if (totalWorth > 200 && totalWorth <= 500) {
      commentElement.textContent = "You are crazy, man! Keep going!";
  } 
  else if (totalWorth > 500 && totalWorth <= 1000) {
    commentElement.textContent = "Bro, It seems that you are getting Insider Informations";
  } 
  else if (totalWorth > 1000) {
      commentElement.textContent = "Is my website having the next Warren Buffett?";
  }
}

function removeStock(symbol) {
  const index = portfolio.findIndex((stock) => stock.symbol === symbol);
  portfolio.splice(index, 1);
  updatePortfolio();
  updateStockPerformance();
}

function updateStockPerformance() {
    const container = document.getElementById("stock-performance-container");
    container.innerHTML = portfolio
        .map(
            (stock) => `
      <div class="stock-card">
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-open">Open Price: $${stock.open.toFixed(2)}</div>
        <div class="stock-close">Close Price: $${stock.close.toFixed(2)}</div>
        <div class="stock-high">High Price: $${stock.high.toFixed(2)}</div>
        <div class="stock-low">Low Price: $${stock.low.toFixed(2)}</div>
      </div>
    `
        )
        .join("");
}

document.getElementById("search-button").addEventListener("click", () => {
    const symbol = document.getElementById("stock-symbol").value.toUpperCase();
    if (symbol) {
        addStockToPortfolio(symbol);
        document.getElementById("stock-symbol").value = ""; 
    }
});

document.getElementById("stock-symbol").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const symbol = document.getElementById("stock-symbol").value.toUpperCase();
        if (symbol) {
            addStockToPortfolio(symbol);
            document.getElementById("stock-symbol").value = ""; 
        }
    }
});

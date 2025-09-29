// Supabase client
const SUPABASE_URL = "https://kmjgyqqbqcxwpavwgnsu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttamd5cXFicWN4d3BhdndnbnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTIzNjMsImV4cCI6MjA3NDcyODM2M30.uHWMB_DeQn4nQ-MWcwEKVhnskA_K1AlGoAacmxVu3b0";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentPrice = 0;
let userProfile = null;

// Load user & profile
async function loadUserData() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("id, username, currency, balance")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(profileError);
    return;
  }

  userProfile = profile;
  document.getElementById("username").textContent = profile.username;
  document.getElementById("balance").textContent = 
    `Balance: ${profile.currency} ${profile.balance}`;
  document.getElementById("balance-display").textContent =
    `${profile.currency} ${profile.balance}`;

  loadTrades();
}

// Place trade
async function placeTrade(type) {
  const amount = parseFloat(document.getElementById("trade-amount").value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  if (userProfile.balance < amount) {
    alert("Insufficient balance");
    return;
  }

  const { error } = await supabaseClient.from("transactions").insert({
    user_id: userProfile.id,
    type,
    amount,
    entry_price: currentPrice,
    status: "open",
    symbol: "BTC/USDT"
  });

  if (error) {
    console.error(error);
    return;
  }

  // Deduct balance
  await supabaseClient
    .from("profiles")
    .update({ balance: userProfile.balance - amount })
    .eq("id", userProfile.id);

  alert(`Trade placed: ${type.toUpperCase()} ${amount} @ ${currentPrice}`);
  loadUserData();
}

// Load trades
async function loadTrades() {
  const { data: trades, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("user_id", userProfile.id)
    .eq("status", "open");

  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.getElementById("trades-list");
  tbody.innerHTML = "";
  trades.forEach(trade => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trade.type}</td>
      <td>${trade.amount}</td>
      <td>${trade.entry_price}</td>
      <td>${trade.status}</td>
      <td><button onclick="closeTrade('${trade.id}', ${trade.amount}, ${trade.entry_price})">Close</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Close trade
async function closeTrade(tradeId, amount, entryPrice) {
  const exitPrice = currentPrice;
  const profitLoss = (exitPrice - entryPrice) * (amount / entryPrice);

  // Update transaction
  await supabaseClient
    .from("transactions")
    .update({
      status: "closed",
      exit_price: exitPrice,
      profit_loss: profitLoss
    })
    .eq("id", tradeId);

  // Update balance
  await supabaseClient
    .from("profiles")
    .update({
      balance: userProfile.balance + amount + profitLoss
    })
    .eq("id", userProfile.id);

  alert(`Trade closed. P/L: ${profitLoss.toFixed(2)}`);
  loadUserData();
}

// Live Chart with Binance API
function initChart() {
  const chartEl = document.getElementById("tv-chart");
  const chart = LightweightCharts.createChart(chartEl, {
    layout: { background: { color: '#0d1117' }, textColor: '#c9d1d9' },
    grid: { vertLines: { color: '#161b22' }, horzLines: { color: '#161b22' } },
    width: chartEl.clientWidth,
    height: chartEl.clientHeight,
  });

  const lineSeries = chart.addLineSeries({ color: '#26a69a' });

  async function fetchPrice() {
    try {
      const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
      const data = await res.json();
      currentPrice = parseFloat(data.price);

      const now = Math.floor(Date.now() / 1000);
      lineSeries.update({ time: now, value: currentPrice });
    } catch (err) {
      console.error(err);
    }
  }

  fetchPrice();
  setInterval(fetchPrice, 3000);

  window.addEventListener('resize', () => {
    chart.applyOptions({ width: chartEl.clientWidth, height: chartEl.clientHeight });
  });
}

// Logout
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// Run
loadUserData();
initChart();

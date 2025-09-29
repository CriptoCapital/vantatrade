// app.js
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("app-title").textContent = window.__env.APP_NAME;

const chartEl = document.getElementById("tv-chart");

// --- TradingView Lightweight Chart ---
const chart = LightweightCharts.createChart(chartEl, {
  layout: { background: { color: '#0d1117' }, textColor: '#c9d1d9' },
  grid: { vertLines: { color: '#161b22' }, horzLines: { color: '#161b22' } },
  width: chartEl.clientWidth,
  height: chartEl.clientHeight,
});

const candleSeries = chart.addCandlestickSeries({
  upColor: '#26a69a',
  borderUpColor: '#26a69a',
  wickUpColor: '#26a69a',
  downColor: '#ef5350',
  borderDownColor: '#ef5350',
  wickDownColor: '#ef5350',
});

// Demo data
candleSeries.setData([
  { time: '2025-09-21', open: 100, high: 110, low: 90, close: 105 },
  { time: '2025-09-22', open: 106, high: 115, low: 100, close: 108 },
  { time: '2025-09-23', open: 108, high: 112, low: 101, close: 103 },
  { time: '2025-09-24', open: 103, high: 109, low: 95, close: 97 },
  { time: '2025-09-25', open: 97, high: 102, low: 92, close: 100 },
]);

// Make chart responsive
window.addEventListener('resize', () => {
  chart.applyOptions({ width: chartEl.clientWidth, height: chartEl.clientHeight });
});

// --- Supabase integration ---
async function loadUserData() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    document.getElementById("balance").textContent = "Please log in";
    return;
  }

  const userId = user.id;

  // Try fetch user account
  let { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === "PGRST116") {
    // No row exists → create default one
    const { data: newDoc, error: insertError } = await supabase
      .from('accounts')
      .insert([{ id: userId, balance: 10000, currency: "USD" }])
      .select()
      .single();

    if (!insertError) {
      data = newDoc;
    }
  }

  // Fallback balance display
  if (data) {
    document.getElementById("balance").textContent = `Balance: ${data.currency} ${data.balance}`;
  } else {
    document.getElementById("balance").textContent = "Balance: Demo $10,000";
  }
}

loadUserData();

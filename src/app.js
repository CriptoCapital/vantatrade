// app.js
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("app-title").textContent = window.__env.APP_NAME;

const chartEl = document.getElementById("tv-chart");

// Create chart
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

// ✅ Make chart responsive
window.addEventListener('resize', () => {
  chart.applyOptions({ width: chartEl.clientWidth, height: chartEl.clientHeight });
});

// ---- Supabase balance ----
async function loadBalance() {
  try {
    const { data, error } = await supabase.from('accounts').select('balance').single();
    if (error) throw error;
    document.getElementById("balance").textContent = `Balance: $${data.balance}`;
  } catch {
    document.getElementById("balance").textContent = "Balance: Demo $10,000";
  }
}
loadBalance();

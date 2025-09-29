// Supabase client
const SUPABASE_URL = "https://kmjgyqqbqcxwpavwgnsu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttamd5cXFicWN4d3BhdndnbnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTIzNjMsImV4cCI6MjA3NDcyODM2M30.uHWMB_DeQn4nQ-MWcwEKVhnskA_K1AlGoAacmxVu3b0";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check auth & load profile
async function loadUserData() {
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

  if (!user || authError) {
    // Redirect if not logged in
    window.location.href = "login.html";
    return;
  }

  // Fetch user profile from "profiles"
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("username, currency, balance")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    document.getElementById("username").textContent = "Unknown user";
    document.getElementById("balance").textContent = "No balance found";
    console.error(error);
    return;
  }

  // Update UI
  document.getElementById("username").textContent = profile.username;
  document.getElementById("balance").textContent = 
    `Balance: ${profile.currency} ${profile.balance}`;
}

// Logout
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}

// Setup TradingView Lightweight Chart
function initChart() {
  const chartEl = document.getElementById("tv-chart");

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

  // Demo data (replace with live feed later)
  candleSeries.setData([
    { time: '2025-09-21', open: 100, high: 110, low: 90, close: 105 },
    { time: '2025-09-22', open: 106, high: 115, low: 100, close: 108 },
    { time: '2025-09-23', open: 108, high: 112, low: 101, close: 103 },
    { time: '2025-09-24', open: 103, high: 109, low: 95, close: 97 },
    { time: '2025-09-25', open: 97, high: 102, low: 92, close: 100 },
  ]);

  // Responsive chart
  window.addEventListener('resize', () => {
    chart.applyOptions({ width: chartEl.clientWidth, height: chartEl.clientHeight });
  });
}

// Run
loadUserData();
initChart();

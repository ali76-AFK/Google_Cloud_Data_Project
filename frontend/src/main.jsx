import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITEAPIBASEURL ||
  "http://localhost:8000";

const DEFAULT_START = "2020-11-01";
const DEFAULT_END = "2021-01-31";

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "number") {
    return new Intl.NumberFormat().format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function formatCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
}

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function prettifyKey(key) {
  return String(key)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getOverviewMetricObject(overview) {
  if (!isPlainObject(overview)) return {};

  const preferredKeys = [
    "summary",
    "metrics",
    "totals",
    "overview",
    "kpis",
    "data",
  ];

  for (const key of preferredKeys) {
    if (isPlainObject(overview[key])) {
      return overview[key];
    }
  }

  const scalarEntries = Object.entries(overview).filter(
    ([, value]) =>
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
  );

  return Object.fromEntries(scalarEntries);
}

function getOverviewTimeseries(overview) {
  if (!isPlainObject(overview)) return [];

  const candidateKeys = [
    "timeseries",
    "time_series",
    "series",
    "trend",
    "trends",
    "daily",
    "rows",
    "data",
  ];

  let source = null;

  for (const key of candidateKeys) {
    if (Array.isArray(overview[key])) {
      source = overview[key];
      break;
    }
  }

  if (!source) {
    const nestedArrayEntry = Object.entries(overview).find(([, value]) =>
      Array.isArray(value)
    );
    source = nestedArrayEntry ? nestedArrayEntry[1] : [];
  }

  if (!Array.isArray(source)) return [];

  return source
    .filter((row) => isPlainObject(row))
    .map((row, index) => {
      const date =
        row.date ||
        row.day ||
        row.week ||
        row.month ||
        row.period ||
        row.label ||
        `Row ${index + 1}`;

      return {
        date: String(date),
        purchases: toNumber(row.purchases),
        transactions: toNumber(row.transactions),
        purchase_revenue: toNumber(row.purchase_revenue),
        total_item_quantity: toNumber(row.total_item_quantity),
        avg_order_value: toNumber(row.avg_order_value),
      };
    });
}

function StatGrid({ data, title }) {
  if (!isPlainObject(data)) return null;

  const entries = Object.entries(data).filter(
    ([, value]) =>
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
  );

  if (!entries.length) return null;

  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.h2}>{title}</h2>
      </div>

      <div style={styles.statGrid}>
        {entries.map(([key, value]) => (
          <div key={key} style={styles.statCard}>
            <div style={styles.statLabel}>{prettifyKey(key)}</div>
            <div style={styles.statValue}>{formatValue(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function KeyValueTable({ data, title }) {
  if (!isPlainObject(data)) return null;

  const entries = Object.entries(data).filter(
    ([, value]) => !Array.isArray(value) && !isPlainObject(value)
  );

  if (!entries.length) return null;

  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.h2}>{title}</h2>
      </div>

      <div style={styles.kvTable}>
        {entries.map(([key, value]) => (
          <div key={key} style={styles.kvRow}>
            <div style={styles.kvKey}>{prettifyKey(key)}</div>
            <div style={styles.kvValue}>{formatValue(value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArrayTable({ rows, title }) {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const objectRows = rows.filter((row) => isPlainObject(row));
  if (!objectRows.length) return null;

  const columnSet = new Set();

  objectRows.forEach((row) => {
    Object.keys(row).forEach((key) => columnSet.add(key));
  });

  const columns = Array.from(columnSet);
  if (!columns.length) return null;

  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.h2}>{title}</h2>
        <span style={styles.badge}>{objectRows.length} rows</span>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={styles.th}>
                  {prettifyKey(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {objectRows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => {
                  const cell = row?.[col];
                  const displayValue =
                    isPlainObject(cell) || Array.isArray(cell)
                      ? JSON.stringify(cell)
                      : formatValue(cell);

                  return (
                    <td key={col} style={styles.td}>
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function JsonPanel({ title, data }) {
  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.h2}>{title}</h2>
      </div>
      <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}

function OverviewTimeseriesChart({ overview }) {
  const chartData = useMemo(() => getOverviewTimeseries(overview), [overview]);

  if (!chartData.length) return null;

  return (
    <section style={styles.card}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.h2}>Overview trends</h2>
          <div style={styles.sectionSubtle}>
            Using the existing overview response fields only
          </div>
        </div>
      </div>

      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 20, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "purchase_revenue" || name === "avg_order_value") {
                  return [
                    formatCurrency(value),
                    prettifyKey(name),
                  ];
                }

                return [formatCompactNumber(value), prettifyKey(name)];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "#334155" }}>{prettifyKey(value)}</span>
              )}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="purchases"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="purchase_revenue"
              stroke="#059669"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="total_item_quantity"
              stroke="#ea580c"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="avg_order_value"
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function App() {
  const [start, setStart] = useState(DEFAULT_START);
  const [end, setEnd] = useState(DEFAULT_END);

  const [health, setHealth] = useState(null);
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState(null);

  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState("");

  async function loadData({ silent = false, nextStart = start, nextEnd = end } = {}) {
    try {
      setError("");

      if (silent) setReloading(true);
      else setLoading(true);

      const overviewParams = new URLSearchParams({
        start: nextStart,
        end: nextEnd,
      });

      const funnelParams = new URLSearchParams({
        start: nextStart,
        end: nextEnd,
      });

      const [healthRes, overviewRes, funnelRes] = await Promise.all([
        fetch(`${API_BASE}/health`),
        fetch(`${API_BASE}/api/overview?${overviewParams.toString()}`),
        fetch(`${API_BASE}/api/funnel?${funnelParams.toString()}`),
      ]);

      if (!healthRes.ok) {
        throw new Error(`Health failed: ${healthRes.status}`);
      }

      if (!overviewRes.ok) {
        throw new Error(`Overview failed: ${overviewRes.status}`);
      }

      if (!funnelRes.ok) {
        throw new Error(`Funnel failed: ${funnelRes.status}`);
      }

      const [healthJson, overviewJson, funnelJson] = await Promise.all([
        healthRes.json(),
        overviewRes.json(),
        funnelRes.json(),
      ]);

      setHealth(healthJson);
      setOverview(overviewJson);
      setFunnel(funnelJson);
    } catch (err) {
      setHealth(null);
      setOverview(null);
      setFunnel(null);
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
      setReloading(false);
    }
  }

  useEffect(() => {
    loadData({
      nextStart: DEFAULT_START,
      nextEnd: DEFAULT_END,
    });
  }, []);

  const overviewMetrics = useMemo(
    () => getOverviewMetricObject(overview),
    [overview]
  );

  const funnelRows = useMemo(() => {
    if (Array.isArray(funnel)) return funnel;
    if (Array.isArray(funnel?.rows)) return funnel.rows;
    if (Array.isArray(funnel?.data)) return funnel.data;
    if (Array.isArray(funnel?.steps)) return funnel.steps;
    return [];
  }, [funnel]);

  const overviewNested = useMemo(() => {
    if (!isPlainObject(overview)) return [];

    return Object.entries(overview).filter(([key, value]) => {
      if (!isPlainObject(value)) return false;

      const hasScalarValues = Object.values(value).some(
        (item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean" ||
          item === null
      );

      return hasScalarValues && !["summary", "metrics", "totals", "overview", "kpis", "data"].includes(key);
    });
  }, [overview]);

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>CP</div>
        <div style={styles.sidebarText}>CampaignPulse</div>
      </aside>

      <main style={styles.main}>
        <header style={styles.hero}>
          <div>
            <h1 style={styles.h1}>Marketing performance dashboard</h1>
            <p style={styles.subtle}>Live from your existing FastAPI endpoints.</p>
          </div>

          <div style={styles.controls}>
            <input
              style={styles.input}
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <input
              style={styles.input}
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
            <button
              style={styles.primaryBtn}
              onClick={() => loadData({ nextStart: start, nextEnd: end })}
              disabled={loading || reloading}
            >
              {reloading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <section style={styles.statusRow}>
          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>API base</div>
            <div style={styles.statusValueSmall}>{API_BASE}</div>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>Health</div>
            <div
              style={{
                ...styles.healthPill,
                background: health ? "#dcfce7" : "#fee2e2",
                color: health ? "#166534" : "#991b1b",
              }}
            >
              {health ? "Connected" : "Disconnected"}
            </div>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusLabel}>Date range</div>
            <div style={styles.statusValueSmall}>
              {start} → {end}
            </div>
          </div>
        </section>

        {loading ? (
          <section style={styles.card}>
            <div style={styles.loading}>Loading dashboard…</div>
          </section>
        ) : error ? (
          <section style={styles.card}>
            <div style={styles.errorTitle}>Request failed</div>
            <div style={styles.errorText}>{error}</div>
          </section>
        ) : (
          <>
            <StatGrid title="Overview metrics" data={overviewMetrics} />

            <OverviewTimeseriesChart overview={overview} />

            {overviewNested.map(([key, value]) => (
              <KeyValueTable
                key={key}
                title={prettifyKey(key)}
                data={value}
              />
            ))}

            <ArrayTable title="Funnel breakdown" rows={funnelRows} />

            {!funnelRows.length && funnel && (
              <JsonPanel title="Funnel JSON" data={funnel} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    background: "#f6f7fb",
    color: "#111827",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  sidebar: {
    background: "#0f172a",
    color: "white",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #4f46e5, #2563eb)",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  sidebarText: {
    fontSize: "18px",
    fontWeight: 700,
  },
  main: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  hero: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  h1: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.15,
  },
  h2: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    textTransform: "capitalize",
  },
  subtle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  sectionSubtle: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "14px",
  },
  controls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "10px 12px",
    background: "white",
  },
  primaryBtn: {
    border: 0,
    borderRadius: "12px",
    padding: "10px 16px",
    background: "#4f46e5",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  statusRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  statusCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "18px",
  },
  statusLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6b7280",
    marginBottom: "10px",
  },
  statusValueSmall: {
    fontSize: "14px",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  healthPill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: 700,
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  badge: {
    fontSize: "12px",
    background: "#eef2ff",
    color: "#4338ca",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: 700,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  statCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
    background: "#fcfcfd",
  },
  statLabel: {
    fontSize: "12px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 800,
    lineHeight: 1.1,
  },
  kvTable: {
    display: "grid",
    gap: "10px",
  },
  kvRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "16px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  kvKey: {
    color: "#6b7280",
    textTransform: "capitalize",
  },
  kvValue: {
    fontWeight: 600,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
  },
  chartWrap: {
    width: "100%",
    height: "380px",
  },
  pre: {
    margin: 0,
    padding: "16px",
    background: "#0f172a",
    color: "#e2e8f0",
    borderRadius: "16px",
    overflowX: "auto",
    fontSize: "13px",
  },
  loading: {
    fontSize: "16px",
    color: "#475569",
  },
  errorTitle: {
    fontWeight: 800,
    marginBottom: "8px",
    color: "#991b1b",
  },
  errorText: {
    color: "#7f1d1d",
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  CreditCard,
  Download,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Menu,
  Package,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import { categories, customers, makeSalesData, orders, periodOptions, products } from "./data.js";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Orders", icon: ShoppingBag, badge: "12" },
  { label: "Products", icon: Package },
  { label: "Customers", icon: Users },
  { label: "Reports", icon: LineChartIcon },
];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return formatter.format(value);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(payload[0].value)}</p>
      {payload[1] && <p className="mt-1 text-xs text-slate-500">{payload[1].value} orders</p>}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, comparison, tone }) {
  const positive = change >= 0;
  return (
    <article className="kpi-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-[1.7rem] font-semibold tracking-tight text-slate-900 sm:text-[1.9rem]">{value}</p>
        </div>
        <span className={`kpi-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className={`change-pill ${positive ? "positive" : "negative"}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </span>
        <span className="text-slate-400">{comparison}</span>
      </div>
    </article>
  );
}

function Sidebar({ activePage, onNavigate, open, onClose }) {
  return (
    <>
      {open && <button className="sidebar-backdrop lg:hidden" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="flex h-[76px] items-center gap-3 px-6">
          <div className="brand-mark"><Activity size={19} strokeWidth={2.5} /></div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">commerce<span className="text-violet-600">pulse</span></span>
          <button className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Close navigation" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="px-4 pt-5">
          <p className="nav-label">WORKSPACE</p>
          <button className="workspace-switch">
            <span className="workspace-avatar">M</span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-slate-800">Morrow Supply Co.</span>
              <span className="block text-xs text-slate-400">Growth plan</span>
            </span>
            <ChevronDown size={15} className="text-slate-400" />
          </button>
        </div>
        <nav className="mt-8 px-3" aria-label="Main navigation">
          <p className="nav-label px-3">MENU</p>
          <div className="mt-2 space-y-1">
            {navigation.map(({ label, icon: Icon, badge }) => (
              <button
                key={label}
                onClick={() => { onNavigate(label); onClose(); }}
                className={`nav-item ${activePage === label ? "nav-item-active" : ""}`}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1 text-left">{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </button>
            ))}
          </div>
        </nav>
        <div className="mt-8 px-3">
          <p className="nav-label px-3">INSIGHTS</p>
          <button className="nav-item mt-2" onClick={() => onNavigate("Reports")}>
            <Sparkles size={18} strokeWidth={1.8} />
            <span className="flex-1 text-left">AI assistant</span>
            <span className="new-badge">NEW</span>
          </button>
        </div>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="flex items-center gap-2 text-slate-700"><CircleHelp size={16} /><span className="text-xs font-semibold">Need a hand?</span></div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Explore the guide and get more from your store data.</p>
            <button className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">Visit help center <ArrowRight size={13} /></button>
          </div>
          <button className="nav-item mt-3"><Settings2 size={18} strokeWidth={1.8} /><span className="flex-1 text-left">Settings</span></button>
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 px-3 pt-4">
            <div className="profile-avatar">AR</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">Alex Rivera</p>
              <p className="truncate text-xs text-slate-400">alex@morrow.co</p>
            </div>
            <ChevronDown size={15} className="text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
}

function SalesChart({ data, days }) {
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 13;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#765cf4" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#765cf4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#edf0f5" strokeDasharray="3 5" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#98a2b3", fontSize: 11 }} interval={tickInterval} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#98a2b3", fontSize: 11 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} width={48} />
        <YAxis yAxisId="orders" orientation="right" hide domain={[0, "dataMax + 10"]} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#c9c2ff", strokeDasharray: "4 4" }} />
        <Area type="monotone" dataKey="revenue" stroke="#7057e8" strokeWidth={2.5} fill="url(#revenueGradient)" activeDot={{ r: 5, fill: "#7057e8", stroke: "#fff", strokeWidth: 3 }} />
        <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="#aeb6c4" strokeWidth={1.5} strokeDasharray="4 5" dot={false} activeDot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function PowerBIReport() {
  const [embedConfig, setEmbedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/powerbi/embed-config");
      if (!response.ok) throw new Error(`Power BI setup returned ${response.status}.`);
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Configure a backend JSON route at /api/powerbi/embed-config to connect your report.");
      }
      const config = await response.json();
      if (!config?.id || !config?.embedUrl || !config?.accessToken) {
        throw new Error("The embed-config endpoint must return id, embedUrl, and accessToken.");
      }
      setEmbedConfig({
        type: "report",
        id: config.id,
        embedUrl: config.embedUrl,
        accessToken: config.accessToken,
        tokenType: config.tokenType === "Aad" ? models.TokenType.Aad : models.TokenType.Embed,
        permissions: models.Permissions.Read,
        settings: { panes: { filters: { expanded: false, visible: true }, pageNavigation: { visible: true } } },
      });
    } catch (loadError) {
      setError(loadError.message || "Unable to load the Power BI report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel mt-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Power BI report</h2>
          <p className="mt-1 text-sm text-slate-500">Connect your workspace report to explore deeper insights.</p>
        </div>
        <button className="primary-button" onClick={loadReport} disabled={loading}>
          {loading ? <span className="loading-dot" /> : <Activity size={15} />}
          {loading ? "Connecting..." : "Load report"}
        </button>
      </div>
      <div className="powerbi-frame">
        {embedConfig ? (
          <PowerBIEmbed
            embedConfig={embedConfig}
            cssClassName="powerbi-embed"
            eventHandlers={new Map([["loaded", () => setError("")], ["error", (event) => setError(event?.detail?.message || "The Power BI report could not be displayed.")]])}
          />
        ) : (
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="report-mark mx-auto"><BarChart size={22} /></div>
            <h3 className="mt-4 text-sm font-semibold text-slate-800">Your report, all in one place</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Load a report using your secure embed-config API. Your server should generate short-lived embed tokens; never put Power BI secrets in frontend code.</p>
          </div>
        )}
        {error && <p role="alert" className="absolute bottom-3 left-4 right-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      </div>
    </section>
  );
}

function WorkspacePage({ page, query }) {
  const normalizedQuery = query.toLowerCase();

  if (page === "Orders") {
    const visibleOrders = orders.filter((order) =>
      `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(normalizedQuery),
    );
    return (
      <section className="panel overflow-hidden">
        <div className="px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">All orders</h2>
          <p className="mt-1 text-sm text-slate-500">Search, review, and export your recent store orders.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="orders-table">
            <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>PRODUCT</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
            <tbody>{visibleOrders.map((order) => (
              <tr key={order.id}>
                <td><span className="block text-xs font-semibold text-slate-700">{order.id}</span><span className="mt-1 block text-[10px] text-slate-400">{order.date}</span></td>
                <td><span className="text-xs font-medium text-slate-700">{order.customer}</span></td>
                <td><span className="whitespace-nowrap text-xs text-slate-600">{order.product}</span></td>
                <td className="whitespace-nowrap text-xs font-semibold text-slate-700">{formatCurrency(order.amount)}</td>
                <td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td>
              </tr>
            ))}{visibleOrders.length === 0 && <tr><td colSpan="5" className="py-10 text-center text-sm text-slate-500">No orders match “{query}”.</td></tr>}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 sm:px-6">
          <span className="text-xs text-slate-400">{visibleOrders.length} orders</span>
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"><Plus size={13} /> New order</button>
        </div>
      </section>
    );
  }

  if (page === "Products") {
    const visibleProducts = products.filter((product) =>
      `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(normalizedQuery),
    );
    return (
      <section className="panel overflow-hidden">
        <div className="px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">Product performance</h2>
          <p className="mt-1 text-sm text-slate-500">Your best sellers and inventory performance this month.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="orders-table">
            <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th>UNITS SOLD</th><th>CHANGE</th></tr></thead>
            <tbody>{visibleProducts.map((product) => (
              <tr key={product.sku}>
                <td><span className="block text-xs font-semibold text-slate-700">{product.name}</span><span className="mt-1 block text-[10px] text-slate-400">{product.sku}</span></td>
                <td className="text-xs text-slate-600">{product.category}</td>
                <td className="text-xs font-semibold text-slate-700">{formatCurrency(product.price)}</td>
                <td className="text-xs text-slate-600">{product.units.toLocaleString()}</td>
                <td><span className={`product-change ${product.change >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{product.change >= 0 ? "+" : ""}{product.change}%</span></td>
              </tr>
            ))}{visibleProducts.length === 0 && <tr><td colSpan="5" className="py-10 text-center text-sm text-slate-500">No products match “{query}”.</td></tr>}</tbody>
          </table>
        </div>
      </section>
    );
  }

  const visibleCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.segment}`.toLowerCase().includes(normalizedQuery),
  );
  return (
    <section className="panel overflow-hidden">
      <div className="px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Customer directory</h2>
        <p className="mt-1 text-sm text-slate-500">Understand your customer relationships and lifetime value.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="orders-table">
          <thead><tr><th>CUSTOMER</th><th>SEGMENT</th><th>ORDERS</th><th>TOTAL SPENT</th></tr></thead>
          <tbody>{visibleCustomers.map((customer) => (
            <tr key={customer.email}>
              <td><span className="block text-xs font-semibold text-slate-700">{customer.name}</span><span className="mt-1 block text-[10px] text-slate-400">{customer.email}</span></td>
              <td><span className={`status-pill ${customer.segment === "VIP" ? "status-paid" : customer.segment === "New" ? "status-pending" : "status-refunded"}`}>{customer.segment}</span></td>
              <td className="text-xs text-slate-600">{customer.orders}</td>
              <td className="text-xs font-semibold text-slate-700">{formatCurrency(customer.spent)}</td>
            </tr>
          ))}{visibleCustomers.length === 0 && <tr><td colSpan="4" className="py-10 text-center text-sm text-slate-500">No customers match “{query}”.</td></tr>}</tbody>
        </table>
      </div>
    </section>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [period, setPeriod] = useState(30);
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const chartData = useMemo(() => makeSalesData(period, category), [period, category]);
  const filteredOrders = orders.filter((order) =>
    `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(query.toLowerCase()),
  );
  const totalRevenue = chartData.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = chartData.reduce((sum, point) => sum + point.orders, 0);
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

  function exportOrders() {
    const rows = [["Order", "Customer", "Product", "Date", "Amount", "Status"], ...filteredOrders.map(({ id, customer, product, date, amount, status }) => [id, customer, product, date, amount, status])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "commerce-pulse-orders.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    setExportMessage("Orders exported");
    window.setTimeout(() => setExportMessage(""), 2200);
  }

  const isReportPage = activePage === "Reports";
  const isOverviewPage = activePage === "Overview";
  const pageTitle = {
    Overview: "Good morning, Alex",
    Orders: "Orders",
    Products: "Products",
    Customers: "Customers",
    Reports: "Reports & insights",
  }[activePage];

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-area">
        <header className="topbar">
          <div className="flex min-w-0 items-center gap-3">
            <button className="icon-button lg:hidden" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
            <div className="breadcrumb hidden sm:flex"><span>Workspace</span><span className="breadcrumb-slash">/</span><span className="font-medium text-slate-700">{isReportPage ? "Reports" : activePage}</span></div>
            <p className="text-sm font-semibold text-slate-800 sm:hidden">{isReportPage ? "Reports" : activePage}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="search-box hidden md:flex">
              <Search size={16} className="text-slate-400" />
              <input aria-label={`Search ${activePage === "Overview" ? "orders" : activePage.toLowerCase()}`} placeholder={`Search ${activePage === "Overview" ? "orders" : activePage.toLowerCase()}...`} value={query} onChange={(event) => setQuery(event.target.value)} />
              <span className="search-shortcut"><Command size={11} /> K</span>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
            <span className="topbar-divider hidden sm:block" />
            <button className="upgrade-button hidden sm:inline-flex"><Plus size={14} /> Upgrade plan</button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <p className="eyebrow"><span className="live-dot" /> STORE OVERVIEW</p>
              <h1>{pageTitle}{isOverviewPage && <> <span className="wave">✦</span></>}</h1>
              <p className="page-subtitle">{isReportPage ? "Bring your business intelligence into one view." : isOverviewPage ? "Here’s what’s happening with your store today." : `Manage your store’s ${activePage.toLowerCase()} in one place.`}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(isOverviewPage || activePage === "Orders") && <button className="secondary-button hidden sm:inline-flex" onClick={exportOrders}><Download size={15} /> Export</button>}
              {activePage !== "Orders" && <button className="primary-button" onClick={() => setActivePage("Orders")}><ShoppingBag size={15} /> View orders</button>}
            </div>
          </div>

          {isOverviewPage ? (
            <>
              <section className="kpi-grid" aria-label="Sales key performance indicators">
                <KpiCard icon={CreditCard} label="Total revenue" value={formatCurrency(totalRevenue)} change={12.8} comparison="vs. previous period" tone="violet" />
                <KpiCard icon={ShoppingCart} label="Total orders" value={totalOrders.toLocaleString()} change={8.2} comparison="vs. previous period" tone="mint" />
                <KpiCard icon={Activity} label="Average order value" value={formatCurrency(avgOrder)} change={4.6} comparison="vs. previous period" tone="blue" />
                <KpiCard icon={Users} label="Conversion rate" value="3.62%" change={-0.8} comparison="vs. previous period" tone="peach" />
              </section>

              <section className="panel mt-5">
                <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">Sales performance</h2>
                      <span className="live-tag"><span className="live-dot" /> Live</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Track your revenue over time</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="select-wrap">
                      <span className="sr-only">Filter by product category</span>
                      <select value={category} onChange={(event) => setCategory(event.target.value)}>
                        {categories.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <ChevronDown size={14} />
                    </label>
                    <div className="period-tabs" role="group" aria-label="Select date range">
                      {periodOptions.map((option) => (
                        <button key={option.days} onClick={() => setPeriod(option.days)} className={period === option.days ? "period-active" : ""}>{option.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="chart-summary-row">
                  <div><span className="summary-value">{formatCurrency(totalRevenue)}</span><span className="summary-caption">Revenue in selected period</span></div>
                  <div className="hidden items-center gap-5 sm:flex">
                    <div className="legend-item"><span className="legend-dot bg-violet-500" /> Revenue</div>
                    <div className="legend-item"><span className="legend-line" /> Orders</div>
                  </div>
                </div>
                <div className="sales-chart"><SalesChart data={chartData} days={period} /></div>
                <div className="chart-footnote"><CalendarDays size={13} /> Data refreshed just now <span className="footnote-separator">·</span> Compared with previous period <ArrowDown size={12} /></div>
              </section>

              <section className="lower-grid">
                <div className="panel min-w-0">
                  <div className="flex items-start justify-between px-5 pb-1 pt-5 sm:px-6">
                    <div><h2 className="text-base font-semibold text-slate-900">Top products</h2><p className="mt-1 text-sm text-slate-500">Best sellers this month</p></div>
                    <button className="text-sm font-medium text-violet-600 hover:text-violet-700" onClick={() => setActivePage("Products")}>View all</button>
                  </div>
                  <div className="product-chart"><ResponsiveContainer width="100%" height="100%">
                    <BarChart data={products.filter((item) => category === "All categories" || item.category === category)} layout="vertical" margin={{ top: 10, right: 16, left: 6, bottom: 0 }} barCategoryGap={16}>
                      <CartesianGrid horizontal={false} stroke="#edf0f5" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={128} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip cursor={{ fill: "#f8f7ff" }} formatter={(value) => [`${value.toLocaleString()} units`, "Sold"]} />
                      <Bar dataKey="units" fill="#8b78f1" radius={[0, 5, 5, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer></div>
                  <div className="px-5 pb-5 sm:px-6">
                    <div className="product-list">
                      {products.filter((item) => category === "All categories" || item.category === category).map((product, index) => (
                        <div className="product-row" key={product.sku}>
                          <span className="product-index">{String(index + 1).padStart(2, "0")}</span>
                          <span className="product-color" style={{ background: product.color }} />
                          <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{product.name}</span>
                          <span className="text-xs text-slate-500">{product.units.toLocaleString()} sold</span>
                          <span className={`product-change ${product.change >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{product.change >= 0 ? "+" : ""}{product.change}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="panel min-w-0">
                  <div className="flex items-start justify-between px-5 pb-4 pt-5 sm:px-6">
                    <div><h2 className="text-base font-semibold text-slate-900">Recent orders</h2><p className="mt-1 text-sm text-slate-500">Stay on top of your sales</p></div>
                    <button className="text-sm font-medium text-violet-600 hover:text-violet-700" onClick={() => setActivePage("Orders")}>View all</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="orders-table">
                      <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
                      <tbody>
                        {filteredOrders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td><span className="block text-xs font-semibold text-slate-700">{order.id}</span><span className="mt-1 block text-[10px] text-slate-400">{order.date}</span></td>
                            <td><div className="flex min-w-[132px] items-center gap-2"><span className={`customer-avatar avatar-${order.color}`}>{order.initials}</span><span className="truncate text-xs font-medium text-slate-700">{order.customer}</span></div></td>
                            <td className="whitespace-nowrap text-xs font-semibold text-slate-700">{formatCurrency(order.amount)}</td>
                            <td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-sm text-slate-500">No orders match “{query}”.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 sm:px-6">
                    <span className="text-xs text-slate-400">Showing {Math.min(filteredOrders.length, 5)} of {filteredOrders.length} orders</span>
                    <button onClick={exportOrders} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-violet-600"><Download size={13} /> Export CSV</button>
                  </div>
                </div>
              </section>
            </>
          ) : isReportPage ? <PowerBIReport /> : <WorkspacePage page={activePage} query={query} />}

          {exportMessage && <div role="status" className="toast"><Check size={16} /> {exportMessage}</div>}
          <footer className="page-footer"><span>© 2026 Commerce Pulse</span><span className="hidden sm:inline">Data that moves your business forward.</span><button onClick={() => setActivePage("Reports")}>Power BI reports <ArrowRight size={12} /></button></footer>
        </div>
      </main>
    </div>
  );
}

export default App;

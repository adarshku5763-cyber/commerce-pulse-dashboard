const products = [
  { name: "Studio Headphones", sku: "AU-2048", category: "Electronics", price: 129, units: 1248, change: 18.4, color: "#6758e8" },
  { name: "Everyday Backpack", sku: "AC-1082", category: "Accessories", price: 84, units: 986, change: 12.1, color: "#22b89a" },
  { name: "Ceramic Pour-over", sku: "HM-3041", category: "Home", price: 42, units: 754, change: 8.7, color: "#ef9b53" },
  { name: "Linen Weekend Set", sku: "AP-0063", category: "Apparel", price: 96, units: 639, change: -2.3, color: "#4c91e8" },
];

const categories = ["All categories", "Electronics", "Accessories", "Home", "Apparel"];
const periodOptions = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

const orders = [
  { id: "CP-10482", customer: "Olivia Rhye", initials: "OR", product: "Studio Headphones", date: "Oct 10, 2026", amount: 258, status: "Paid", color: "violet" },
  { id: "CP-10481", customer: "Phoenix Baker", initials: "PB", product: "Everyday Backpack", date: "Oct 10, 2026", amount: 168, status: "Paid", color: "mint" },
  { id: "CP-10480", customer: "Lana Steiner", initials: "LS", product: "Ceramic Pour-over", date: "Oct 09, 2026", amount: 84, status: "Pending", color: "peach" },
  { id: "CP-10479", customer: "Demi Wilkinson", initials: "DW", product: "Linen Weekend Set", date: "Oct 09, 2026", amount: 192, status: "Paid", color: "blue" },
  { id: "CP-10478", customer: "Candice Wu", initials: "CW", product: "Studio Headphones", date: "Oct 09, 2026", amount: 129, status: "Refunded", color: "pink" },
];

const customers = [
  { name: "Olivia Rhye", email: "olivia@example.com", orders: 12, spent: 1486, segment: "VIP" },
  { name: "Phoenix Baker", email: "phoenix@example.com", orders: 8, spent: 924, segment: "Returning" },
  { name: "Lana Steiner", email: "lana@example.com", orders: 6, spent: 712, segment: "Returning" },
  { name: "Demi Wilkinson", email: "demi@example.com", orders: 4, spent: 538, segment: "New" },
  { name: "Candice Wu", email: "candice@example.com", orders: 3, spent: 391, segment: "New" },
];

function seededValue(index, categoryOffset = 0) {
  const wave = Math.sin((index + categoryOffset * 3) / 5.8) * 19;
  const secondaryWave = Math.cos((index + categoryOffset) / 11) * 10;
  const noise = ((index * 17 + categoryOffset * 31) % 13) - 6;
  return Math.max(24, Math.round(116 + wave + secondaryWave + noise));
}

function makeSalesData(days, category) {
  const selectedCategory = categories.indexOf(category);
  const categoryOffset = selectedCategory > 0 ? selectedCategory : 0;
  const multiplier = selectedCategory > 0 ? 0.31 : 1;
  const today = new Date(2026, 9, 10);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    const base = seededValue(index, categoryOffset);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round((base + 28) * 107 * multiplier),
      orders: Math.round((base / 8 + 8) * multiplier),
    };
  });
}

export { categories, customers, makeSalesData, orders, periodOptions, products };

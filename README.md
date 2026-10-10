# Commerce Pulse

A responsive ecommerce sales dashboard built with React, Tailwind CSS, Recharts, and the Power BI React client.

## Run locally

```bash
npm install
npm run dev
```

The dashboard runs with deterministic sample data, so charts, category/date filters, order search, and CSV export work immediately.

## Connect a Power BI report

The **Reports** view requests `GET /api/powerbi/embed-config`. Add this endpoint to your backend and return:

```json
{
  "id": "report-id",
  "embedUrl": "https://app.powerbi.com/reportEmbed?reportId=...",
  "accessToken": "short-lived-embed-token",
  "tokenType": "Embed"
}
```

Generate the embed token on a trusted server using the Power BI REST API and Microsoft Entra credentials. Do not put client secrets or long-lived tokens in Vite environment variables or browser code. The `tokenType` may be `Embed` (default) or `Aad`.

Replace `src/data.js` with your ecommerce API or warehouse-backed data when connecting a live store. Keep credentials and privileged API calls on the server.

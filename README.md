# Webware_C26_Term_Project

For the additional component for this project we decided to do Additional charts.

# Additional Chart Components

## Overview

The additional component chosen for this project is **interactive data visualization charts**, implemented using [Chart.js](https://www.chartjs.org/) and its React wrapper [`react-chartjs-2`](https://react-chartjs-2.js.org/). The goal was to give school administrators a good visual understanding of their data across three categories: **Enrollment**, **Personnel**, and **Admin Support**.

---

## How Chart.js Works in React

Chart.js is a JavaScript charting library. In this project it is used through `react-chartjs-2`, which wraps Chart.js chart types (Bar, Line, Doughnut) as React components.

Each chart type must be registered before use:

```jsx
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
```

Charts accept two main props:
- **`data`** — the labels and datasets to render
- **`options`** — configuration like axis labels, colors, legend position, responsiveness

---

## Reusable Base Chart Components

Rather than writing Chart.js configuration from scratch on every page, each chart type is encapsulated in a single reusable React component. These live in `src/components/charts/` and accept generic `data` and `title` props, meaning they can be used anywhere in the app regardless of what data is passed in.

### `EmployeeBarChartData.jsx` — Bar Chart

Renders a vertical or horizontal bar chart. Accepts a `horizontal` prop to flip the axis (useful for long category labels), and a `multiColor` prop to apply a different color to each bar.

Internally it injects `backgroundColor` into each dataset using a defined color palette, and sets `barPercentage` and `categoryPercentage` at the dataset level to control bar thickness.

### `TrendLineChart.jsx` — Line Chart

Renders a line chart designed for showing data trends over time. It uses `fill: true` and `tension: 0.4` for a smooth area curve, and plots one or more datasets across year labels on the x-axis.

This chart always shows **all years** for the school regardless of the selected year filter, since its purpose is to display the full trend over time.

### `DonutChart.jsx` — Doughnut Chart

Renders a doughnut chart for showing proportional composition. It automatically applies colors from the shared palette to each slice using `COLORS.slice(0, data.labels.length)`, ensuring slices always have distinct colors without manual configuration.

---

## How Each Dashboard Feeds the Charts

Each dashboard category has a corresponding builder function in `DashboardService.js` on the backend. These functions run MongoDB aggregations and return a structured response containing a `charts` object with keys for each chart type: `bar`, `bar2`, `line`, and `donut`.

This shape matches exactly what Chart.js expects as its `data` prop, so no transformation is needed on the frontend — the response can be passed directly into the chart components.

### Enrollment Dashboard
- **Bar** — Students added, not returning, and graduated for the selected year
- **Bar2** — Side-by-side comparison of the selected year vs previous year across all three enrollment metrics
- **Line** — Trend of students added, graduated, and not returning across all years
- **Donut** — Breakdown of returned, graduated, and not returning students as proportions of the total

### Personnel Dashboard
- **Bar** — Total employees, FTEs, and subcontractors for the selected year
- **Bar2** — Total and full-time employees broken down by employee category code (e.g. Instructional Staff, Custodial Staff), with human-readable labels resolved via a `$lookup` on the `refCode` collection
- **Line** — Total employee headcount trend across all years
- **Donut** — Staff composition by category — each employee category is a slice of the whole

### Admin Support Dashboard
- **Bar** — Current year vs previous year for exempt and non-exempt FTE
- **Bar2** — Exempt and non-exempt FTE broken down by admin staff function code (e.g. Development, HR, Finance), with labels resolved via `$lookup` on `refCode`
- **Line** — Exempt FTE, non-exempt FTE, and total FTE trend across all years
- **Donut** — Proportional composition of total FTE by admin staff function

---

## Chart Titles by Category

To make the dashboard more descriptive, chart titles change dynamically based on the selected category using a `CHART_TITLES` lookup object:

This means the chart components themselves stay completely generic — the title context is provided by the parent dashboard page.
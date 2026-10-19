"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatCompactINR, formatINR, formatPercent } from "@/lib/format";
import { CITY_COLORS, type CitySummary } from "@/lib/market";
import type { PricePoint } from "@/lib/types";

const tick = { fill: "#6f6960", fontSize: 12 };

function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: TooltipContentProps["payload"];
  label?: string | number;
  formatValue: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-line bg-card px-3 py-2 text-sm shadow-sm">
      <p className="mb-1 text-muted">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="num text-ink">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color ?? "#17352c" }}
          />
          {entry.name}: {formatValue(Number(entry.value))}
        </p>
      ))}
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 320 }}>
      {children}
    </ResponsiveContainer>
  );
}

export function NationalIndexChart({ data }: { data: { year: number; value: number }[] }) {
  return (
    <Frame>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e4ddd0" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={tick} />
        <YAxis tickLine={false} axisLine={false} tick={tick} width={42} />
        <ReferenceLine y={100} stroke="#c4a574" strokeDasharray="3 3" />
        <Tooltip content={<ChartTooltip formatValue={(value) => value.toFixed(1)} />} />
        <Line
          type="monotone"
          dataKey="value"
          name="Sample index"
          stroke="#17352c"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </Frame>
  );
}

export function CityIndexChart({ summaries }: { summaries: CitySummary[] }) {
  const years = summaries[0]?.index.map((point) => point.year) ?? [];
  const rows = years.map((year) => {
    const row: Record<string, number> = { year };
    for (const summary of summaries) {
      row[summary.city] = summary.index.find((point) => point.year === year)?.value ?? 0;
    }
    return row;
  });

  return (
    <Frame>
      <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e4ddd0" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={tick} />
        <YAxis tickLine={false} axisLine={false} tick={tick} width={42} />
        <ReferenceLine y={100} stroke="#c4a574" strokeDasharray="3 3" />
        <Tooltip content={<ChartTooltip formatValue={(value) => value.toFixed(1)} />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {summaries.map((summary) => (
          <Line
            key={summary.city}
            type="monotone"
            dataKey={summary.city}
            name={summary.city}
            stroke={CITY_COLORS[summary.city] ?? "#17352c"}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </Frame>
  );
}

export function CityBarChart({
  summaries,
  dataKey,
  label,
  color,
  format,
}: {
  summaries: CitySummary[];
  dataKey: "averageYield" | "averagePricePerSqft";
  label: string;
  color: string;
  format: "percent" | "inr";
}) {
  const formatValue = format === "percent" ? (value: number) => formatPercent(value, 1) : formatINR;

  return (
    <Frame>
      <BarChart
        data={summaries}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="#e4ddd0" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={tick} tickFormatter={formatValue} />
        <YAxis
          type="category"
          dataKey="city"
          width={108}
          tickLine={false}
          axisLine={false}
          tick={tick}
        />
        <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
        <Bar dataKey={dataKey} name={label} fill={color} barSize={14} radius={3} />
      </BarChart>
    </Frame>
  );
}

export function PriceHistoryChart({ history }: { history: PricePoint[] }) {
  return (
    <Frame>
      <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e4ddd0" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} tick={tick} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={tick}
          width={72}
          tickFormatter={(value: number) => formatCompactINR(value)}
        />
        <Tooltip content={<ChartTooltip formatValue={formatINR} />} />
        <Line type="monotone" dataKey="price" name="Sample price" stroke="#17352c" strokeWidth={2} dot={false} />
      </LineChart>
    </Frame>
  );
}

export function YieldCompareChart({
  rows,
}: {
  rows: { name: string; gross: number; net: number }[];
}) {
  return (
    <Frame>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#e4ddd0" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={tick} interval={0} />
        <YAxis tickLine={false} axisLine={false} tick={tick} width={48} tickFormatter={(value: number) => `${value}%`} />
        <Tooltip content={<ChartTooltip formatValue={(value) => formatPercent(value)} />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="gross" name="Gross yield" fill="#17352c" radius={3} />
        <Bar dataKey="net" name="Net yield" fill="#8d6840" radius={3} />
      </BarChart>
    </Frame>
  );
}

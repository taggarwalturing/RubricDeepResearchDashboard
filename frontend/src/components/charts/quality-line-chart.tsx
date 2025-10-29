import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { QualityDimensionScore } from "../../types/api.type"

interface QualityLineChartProps {
  data: QualityDimensionScore[]
  title: string
}

export function QualityLineChart(props: QualityLineChartProps) {
  const { data, title } = props

  // Transform data for recharts - horizontal layout
  const chartData = data
    .map((dimension) => ({
      name: dimension.name.replace(/\[DRA\]/g, "").trim(),
      Pass: dimension.passCount,
      Fail: dimension.notPassCount,
      avgScore: dimension.averageScore,
    }))
    .sort((a, b) => (b.Pass + b.Fail) - (a.Pass + a.Fail))

  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            tick={{ className: "quality-chart-axis-tick" }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={200}
            tick={{ className: "quality-chart-axis-tick" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)"
            }}
          />
          <Legend />
          <Bar dataKey="Pass" fill="hsl(var(--success))" name="Pass Count" radius={[0, 8, 8, 0]} />
          <Bar dataKey="Fail" fill="hsl(var(--destructive))" name="Fail Count" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


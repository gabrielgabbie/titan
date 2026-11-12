"use client"

import * as React from "react"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"
import { ChartPie, Table2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CHART_MARGIN, ChartGrid, ChartTip, chartAxisProps } from "@/components/ui/chart-defaults"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import type { Merchant } from "@/lib/data"
import { McBandBadge } from "./badges"
import { gridCell, gridHead, gridRow } from "./grid"

const chartConfig = {
  lowest: { label: "Lowest", color: "var(--chart-1)" },
  average: { label: "Average", color: "var(--chart-2)" },
  highest: { label: "Highest", color: "var(--chart-3)" },
} satisfies ChartConfig

export function McScoreCard({ merchant }: { merchant: Merchant }) {
  const [mode, setMode] = React.useState<"chart" | "grid">("chart")
  const data = merchant.scoreStats.map((s) => ({ period: s.label, ...s.stats }))

  return (
    <Card className="gap-4 py-3">
      <CardHeader className="px-3">
        <CardTitle className="text-sm font-semibold">MC Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tabular-nums">{merchant.mcScore}</span>
            <McBandBadge score={merchant.mcScore} />
          </div>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as "chart" | "grid")}
            className="bg-muted rounded-lg p-[3px]"
          >
            <ToggleGroupItem
              value="chart"
              className="text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground h-7 gap-1.5 rounded-md! px-2 data-[state=on]:shadow-sm"
            >
              <ChartPie /> Chart
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grid"
              className="text-muted-foreground data-[state=on]:bg-background data-[state=on]:text-foreground h-7 gap-1.5 rounded-md! px-2 data-[state=on]:shadow-sm"
            >
              <Table2 /> Grid
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {mode === "chart" ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            {/* aperia-ds5 bar chart; the top margin makes room for the value labels above the bars. */}
            <BarChart data={data} margin={{ ...CHART_MARGIN, top: 20 }}>
              <ChartGrid />
              <XAxis dataKey="period" {...chartAxisProps()} />
              <YAxis domain={[0, 1000]} ticks={[0, 200, 400, 600, 800, 1000]} {...chartAxisProps()} />
              <ChartTip />
              {(["lowest", "average", "highest"] as const).map((k) => (
                <Bar key={k} dataKey={k} fill={`var(--color-${k})`} radius={4}>
                  <LabelList dataKey={k} position="top" offset={6} className="fill-muted-foreground" fontSize={11} />
                </Bar>
              ))}
              <ChartLegend
                content={<ChartLegendContent />}
                itemSorter={(item) => ["lowest", "average", "highest"].indexOf(String(item.dataKey))}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="overflow-hidden rounded-lg bg-card shadow-surface">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="hover:bg-muted">
                  <TableHead className={gridHead}>Measure</TableHead>
                  {data.map((d) => (
                    <TableHead key={d.period} className={cn(gridHead, "text-right")}>
                      {d.period}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(["average", "highest", "lowest"] as const).map((k, i) => (
                  <TableRow key={k} className={gridRow(i, "h-10")}>
                    <TableCell className={gridCell}>{chartConfig[k].label}</TableCell>
                    {data.map((d) => (
                      <TableCell key={d.period} className={cn(gridCell, "text-right tabular-nums")}>
                        {d[k]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

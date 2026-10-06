'use client';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, UNIT_LIMITS as L } from '../../../config/unit.constants';
export default function OccupancyChart({
  occupied,
  total,
}: {
  occupied: number;
  total: number;
}): React.JSX.Element {
  return (
    <div aria-hidden style={{ height: L.CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[
              { value: occupied, fill: CHART_COLORS[0] },
              { value: Math.max(total - occupied, 0), fill: CHART_COLORS[1] },
            ]}
            dataKey="value"
            innerRadius={L.INNER_RADIUS}
            outerRadius={L.OUTER_RADIUS}
          ></Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

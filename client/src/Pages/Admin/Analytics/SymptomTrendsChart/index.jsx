import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { SYMPTOMS } from "@src/constants";

const SymptomTrendsChart = ({
    chartData,
    selectedSymptom,
    loading }) => {
    const maxY = selectedSymptom === "all" ? 220 : 10;

    return (
        <div className="w-full p-4 bg-white shadow rounded-3xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Symptom Trends</h2>

            {loading ? (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={Array(7).fill({ date: "", score: 0 })}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickFormatter={d => d}
                                tick={{ fontSize: 10, fill: "#364153" }}
                            />
                            <YAxis
                                domain={[0, maxY]}
                                tick={{ fontSize: 12 }}
                                label={{
                                    value: "Score",
                                    angle: -90,
                                    position: "insideLeft",
                                    offset: 10,
                                    style: { textAnchor: "middle", fill: "#364153", fontSize: 12 }
                                }}
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#00897b"
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid stroke="#f5f5f5" />
                        <XAxis
                            tick={{
                                fontSize: 10,
                                fill: '#364153'
                            }}
                            dataKey="date"
                        />
                        <YAxis
                            label={{
                                value: "Score",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                                style: { textAnchor: "middle", fill: "#364153", fontSize: 12 }
                            }}
                            domain={[0, maxY]}
                        />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#00897b"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SymptomTrendsChart;
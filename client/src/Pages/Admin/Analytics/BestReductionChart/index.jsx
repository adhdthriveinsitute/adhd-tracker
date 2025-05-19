import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LabelList
} from "recharts";

const BestReductionChart = ({ data, loading }) => {
    // Placeholder data when loading
    const placeholderData = Array(5).fill().map((_, index) => ({
        symptom: `Symptom ${index + 1}`,
        avgPctChange: 0,
        formattedChange: "0%"
    }));

    // Sort data just to be safe (though you already sorted in parent)
    const processedData = loading
        ? placeholderData
        : [...data]
            .sort((a, b) => a.avgPctChange - b.avgPctChange)
            .slice(0, 5);

    const tooltipFormatter = (value, name, props) => {
        const { payload } = props;
        return [`${payload.formattedChange}`, "Reduction"];
    };

    const labelFormatter = (value, entry) => {
        return entry?.formattedChange;
    };

    return (
        <div className="w-full p-4 bg-white shadow rounded-3xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Symptoms with Best Reduction</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={processedData}
                    margin={{ top: 20, right: 20, left: 40, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                    <XAxis
                        type="category"
                        dataKey="symptom"
                        tick={{ fontSize: 11, fill: '#364153', angle: -20, textAnchor: 'end' }}
                        height={60}
                        interval={0}
                    />
                    <YAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(tick) => `-${tick}%`}
                        label={{
                            value: "Reduction Percentage",
                            angle: -90,
                            position: "insideLeft",
                            offset: 0,
                            style: { textAnchor: "middle", fill: "#364153", fontSize: 12 }
                        }}
                    />
                    <Tooltip formatter={tooltipFormatter} />
                    <Bar
                        dataKey="avgPctChange"
                        fill="rgba(76, 175, 80, 0.6)"
                        background={{ fill: "#eee" }}
                        isAnimationActive={!loading}
                    >
                        <LabelList
                            dataKey="avgPctChange"
                            content={({ x, y, width, height, value, index, entry }) => (
                                <text
                                    x={x + width / 2}
                                    y={y - 6}
                                    fill="#444"
                                    fontSize={12}
                                    fontWeight={500}
                                    textAnchor="middle"
                                >
                                    {entry?.formattedChange}
                                </text>
                            )}
                        />

                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BestReductionChart;

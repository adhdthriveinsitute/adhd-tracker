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
    // Create placeholder data for loading state
    const placeholderData = Array(5).fill().map((_, index) => ({
        symptom: `Symptom ${index + 1}`,
        reduction: 0
    }));

    const displayData = loading ? placeholderData : data;

    // Custom tooltip formatter
    const tooltipFormatter = (value) => [`${value}%`, "Reduction"];

    return (
        <div className="w-full p-4 bg-white shadow rounded-3xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Symptoms with Best Reduction</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={displayData}
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
                        dataKey="reduction"
                        fill="rgba(76, 175, 80, 0.6)"
                        background={{ fill: "#eee" }}
                        isAnimationActive={!loading}
                    >
                        <LabelList
                            dataKey="reduction"
                            position="top"
                            formatter={(value) => `-${value}%`}
                            style={{ fill: '#444', fontSize: 12, fontWeight: 500 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BestReductionChart
import { PieChart, Pie, Cell, Label } from "recharts";
import { BsGraphUpArrow } from "react-icons/bs";

export const Widget = (props) => {
    const { id, name } = props.data;
    const graphData = props.data.graphData
    const COLORS = ['#8884d8', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="dark:bg-[#141517] bg-white border dark:border-[#343A40] mx-8 rounded-md my-3">
            <div className="p-4 mb-2">
                <h4 className="text-lg mb-4 dark:text-white">{name}</h4>
                {graphData.length ? 
                <div className="flex justify-between mb-4">
                    <PieChart width={120} height={120}>
                        <Pie
                            dataKey="value"
                            data={graphData}
                            cx={55}
                            cy={55}
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}>

                            {graphData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                    </PieChart>
                    <div className="mt-4 mr-8">
                        {graphData.map((entry, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full mr-2"
                                    style={{
                                        backgroundColor: COLORS[index % COLORS.length],
                                    }}
                                />
                                <span className="text-sm dark:text-white">{entry.name +` (${entry.value})`}</span>
                            </div>
                        ))}
                    </div>
                </div>
                :
                <div className="flex flex-col justify-center items-center mb-4 min-h-28 min-w-60">
                    <BsGraphUpArrow className="text-5xl"/>
                    No Graph data available !
                </div>
                }
            </div>
        </div>
    );
};
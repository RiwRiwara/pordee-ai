import React from 'react';
import { Line } from 'react-chartjs-2';
import { DebtPlanData } from '../types';
import { generateLineChartData } from './chartUtils';

interface LineChartComponentProps {
  debtTypeData: DebtPlanData;
  chartOptions: any;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ 
  debtTypeData,
  chartOptions 
}) => {
  return (
    <div className="h-64 border border-gray-200 rounded-lg p-2">
      <Line
        data={generateLineChartData(debtTypeData)}
        options={{
          ...chartOptions,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "ยอดหนี้ (บาท)",
              },
              ticks: {
                callback: function (value: string | number) {
                  return typeof value === "number"
                    ? value.toLocaleString("th-TH")
                    : value;
                },
              },
            },
            x: {
              title: {
                display: true,
                text: "เดือน",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default LineChartComponent;

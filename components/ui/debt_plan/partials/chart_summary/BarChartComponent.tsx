import React from 'react';
import { Bar } from 'react-chartjs-2';
import { generateBarChartData } from './chartUtils';

interface BarChartComponentProps {
  debtDataByType: Record<string, any>;
  chartOptions: any;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({
  debtDataByType,
  chartOptions
}) => {
  return (
    <div className="h-64 border border-gray-200 rounded-lg p-2">
      <Bar
        data={generateBarChartData(debtDataByType)}
        options={{
          responsive: true,
          maintainAspectRatio: false,
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
                text: "ประเภทหนี้",
              },
            },
          },
          plugins: chartOptions.plugins,
        }}
      />
    </div>
  );
};

export default BarChartComponent;

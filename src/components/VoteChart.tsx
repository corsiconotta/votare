import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface VoteChartProps {
  totalFor: number;
  totalAgainst: number;
  totalAbstain: number;
  totalAbsent: number;
}

const VoteChart: React.FC<VoteChartProps> = ({ 
  totalFor, 
  totalAgainst, 
  totalAbstain, 
  totalAbsent 
}) => {
  const data: ChartData<'doughnut'> = {
    labels: ['For', 'Against', 'Abstain', 'Absent'],
    datasets: [
      {
        data: [totalFor, totalAgainst, totalAbstain, totalAbsent],
        backgroundColor: [
          '#16a34a', // success-600
          '#dc2626', // error-600
          '#f59e0b', // warning-500
          '#94a3b8', // neutral-400
        ],
        borderColor: [
          '#15803d', // success-700
          '#b91c1c', // error-700
          '#d97706', // warning-600
          '#64748b', // neutral-500
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = totalFor + totalAgainst + totalAbstain + totalAbsent;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="h-80">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default VoteChart;
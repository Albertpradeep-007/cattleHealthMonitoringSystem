"use client";

import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface LineChartProps {
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
    }[];
}

export function LineChart({ title, labels, datasets }: LineChartProps) {
    const data = {
        labels,
        datasets: datasets.map(ds => ({
            ...ds,
            tension: 0.4,
            fill: true
        }))
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="h-80">
            <Line data={data} options={options} />
        </div>
    );
}

interface BarChartProps {
    title: string;
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
    }[];
}

export function BarChart({ title, labels, datasets }: BarChartProps) {
    const data = {
        labels,
        datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="h-80">
            <Bar data={data} options={options} />
        </div>
    );
}

interface PieChartProps {
    title: string;
    labels: string[];
    data: number[];
    backgroundColor: string[];
}

export function PieChart({ title, labels, data, backgroundColor }: PieChartProps) {
    const chartData = {
        labels,
        datasets: [
            {
                data,
                backgroundColor,
                borderWidth: 2,
                borderColor: '#fff'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold' as const
                }
            },
        }
    };

    return (
        <div className="h-80">
            <Pie data={chartData} options={options} />
        </div>
    );
}

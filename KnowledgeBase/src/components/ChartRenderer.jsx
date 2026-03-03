import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16'];

/**
 * Parses AI response content and splits it into text segments and chart blocks.
 * Chart blocks are detected by ```chart ... ``` code fences.
 */
export const parseChartBlocks = (content) => {
    if (!content || typeof content !== 'string') return [{ type: 'text', content: content || '' }];

    const parts = [];
    const regex = /```chart\s*\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        // Text before chart block
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
        }

        // Parse chart JSON
        try {
            const chartData = JSON.parse(match[1].trim());
            parts.push({ type: 'chart', data: chartData });
        } catch (e) {
            // If JSON parsing fails, render as text
            parts.push({ type: 'text', content: match[0] });
        }

        lastIndex = match.index + match[0].length;
    }

    // Remaining text after last chart
    if (lastIndex < content.length) {
        parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
};

/**
 * ChartRenderer — renders a chart based on parsed AI chart data.
 * Expected format:
 * {
 *   type: "bar" | "line" | "pie" | "area",
 *   title: "Chart Title",
 *   data: [{ name: "Label", value: 100 }, ...],
 *   xKey: "name",
 *   yKeys: ["value"],
 *   yLabels: ["Label"]  // optional display names
 * }
 */
const ChartRenderer = ({ chartData }) => {
    if (!chartData || !chartData.data || !Array.isArray(chartData.data)) {
        return null;
    }

    const { type = 'bar', title, data, xKey = 'name', yKeys = ['value'], yLabels } = chartData;

    const renderChart = () => {
        switch (type.toLowerCase()) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748B' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            />
                            <Legend />
                            {yKeys.map((key, i) => (
                                <Bar key={key} dataKey={key} name={yLabels?.[i] || key}
                                    fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748B' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            />
                            <Legend />
                            {yKeys.map((key, i) => (
                                <Line key={key} type="monotone" dataKey={key} name={yLabels?.[i] || key}
                                    stroke={COLORS[i % COLORS.length]} strokeWidth={2}
                                    dot={{ r: 4, fill: COLORS[i % COLORS.length] }}
                                    activeDot={{ r: 6 }} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data} dataKey={yKeys[0] || 'value'} nameKey={xKey}
                                cx="50%" cy="50%" outerRadius={100}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={{ stroke: '#94A3B8' }}
                            >
                                {data.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#64748B' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            />
                            <Legend />
                            {yKeys.map((key, i) => (
                                <Area key={key} type="monotone" dataKey={key} name={yLabels?.[i] || key}
                                    stroke={COLORS[i % COLORS.length]}
                                    fill={`${COLORS[i % COLORS.length]}20`}
                                    strokeWidth={2} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            default:
                return <Typography sx={{ color: '#94A3B8', fontSize: '13px' }}>Unsupported chart type: {type}</Typography>;
        }
    };

    return (
        <Paper elevation={0} sx={{
            my: 2, p: 2, borderRadius: 2,
            border: '1px solid #E2E8F0', bgcolor: '#FAFBFC'
        }}>
            {title && (
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', mb: 1.5, textAlign: 'center' }}>
                    📊 {title}
                </Typography>
            )}
            {renderChart()}
        </Paper>
    );
};

export default ChartRenderer;

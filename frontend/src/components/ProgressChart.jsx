import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateExerciseProgress } from '../utils/workoutCalculations';
import { LineChart as ChartIcon } from 'lucide-react';

const ProgressChart = ({ workouts }) => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [chartData, setChartData] = useState([]);
  
  // Extract unique exercise names
  const exerciseNames = [...new Set(
    workouts.flatMap(w => w.exercises?.map(ex => ex.name.trim()) || [])
  )].sort();

  useEffect(() => {
    if (exerciseNames.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseNames[0]);
    }
  }, [exerciseNames, selectedExercise]);

  useEffect(() => {
    if (selectedExercise) {
      const data = calculateExerciseProgress(workouts, selectedExercise);
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [selectedExercise, workouts]);

  if (exerciseNames.length === 0) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-2xl p-6 text-center h-80 flex flex-col items-center justify-center">
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
          Log workouts with exercises to unlock charts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-lg relative">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-lime-500/2 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <ChartIcon className="h-5 w-5 text-lime-400" />
          <h3 className="font-black text-white text-base uppercase tracking-wider">Weight Progression</h3>
        </div>
        
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="bg-slate-950 border border-slate-850 rounded-full text-slate-200 text-xs font-bold py-2 px-4 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all cursor-pointer"
        >
          {exerciseNames.map((name, idx) => (
            <option key={idx} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64 w-full relative z-10">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
              <XAxis 
                dataKey="dateFormatted" 
                stroke="#475569" 
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                unit="kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(2, 6, 23, 0.9)',
                  border: '1px solid #1e293b',
                  borderRadius: '1rem',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                }}
                labelClassName="font-black text-lime-400 text-xs uppercase tracking-wider"
              />
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="#a3e635"
                strokeWidth={3}
                activeDot={{ r: 7, stroke: '#030712', strokeWidth: 2, fill: '#a3e635' }}
                dot={{ stroke: '#030712', strokeWidth: 2, r: 4.5, fill: '#a3e635' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-semibold uppercase tracking-wider">
            No data logged for this exercise.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;

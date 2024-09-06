import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Pause } from 'lucide-react';

const generateTemperatureData = (days) => {
  const dataPoints = days === 1 ? 288 : 288 * 7; // 5-minute intervals for 1 or 7 days
  return Array.from({ length: dataPoints }, (_, i) => ({
    time: i * 5,
    bedTemp: Math.floor(Math.random() * (100 - 60 + 1) + 60),
    nozzleTemp: Math.floor(Math.random() * (220 - 180 + 1) + 180),
  }));
};

const formatXAxis = (tickItem, days) => {
  const hours = Math.floor(tickItem / 60);
  const minutes = tickItem % 60;
  return days === 1 
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    : `Day ${Math.floor(hours / 24) + 1}`;
};

const Dashboard = () => {
  const [viewDays, setViewDays] = useState(1);
  const [tempData, setTempData] = useState(generateTemperatureData(viewDays));
  const [printStatus, setPrintStatus] = useState('Paused');
  const [printCompletion, setPrintCompletion] = useState(45);
  const [remainingTime, setRemainingTime] = useState('2h 15m');
  const [printName, setPrintName] = useState('Benchy.gcode');
  const [failureReason, setFailureReason] = useState('spaghetti');

  useEffect(() => {
    setTempData(generateTemperatureData(viewDays));
  }, [viewDays]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTempData(prevData => [
        ...prevData.slice(1),
        {
          time: prevData[prevData.length - 1].time + 5,
          bedTemp: Math.floor(Math.random() * (100 - 60 + 1) + 60),
          nozzleTemp: Math.floor(Math.random() * (220 - 180 + 1) + 180),
        }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bambu Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Temperature Chart</h2>
              <div className="space-x-2">
                <button 
                  onClick={() => setViewDays(1)} 
                  className={`px-3 py-1 rounded ${viewDays === 1 ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  1 Day
                </button>
                <button 
                  onClick={() => setViewDays(7)} 
                  className={`px-3 py-1 rounded ${viewDays === 7 ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  7 Days
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tickFormatter={(tick) => formatXAxis(tick, viewDays)}
                  label={{ value: viewDays === 1 ? 'Time (HH:MM)' : 'Days', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} 
                />
                <YAxis 
                  stroke="#9CA3AF"
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} 
                />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="bedTemp" stroke="#8B5CF6" name="Bed Temp" dot={false} />
                <Line type="monotone" dataKey="nozzleTemp" stroke="#10B981" name="Nozzle Temp" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Print Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Print Name</p>
                <p className="text-lg font-medium">{printName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <div className="flex items-center space-x-2">
                  {printStatus === 'Printing' && <CheckCircle className="text-green-400" />}
                  {printStatus === 'Paused' && <Pause className="text-yellow-400" />}
                  {printStatus === 'Failed' && <AlertCircle className="text-red-400" />}
                  <p className="text-lg font-medium">{printStatus}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Completion</p>
                <div className="flex items-center space-x-4">
                  <p className="text-2xl font-bold">{printCompletion}%</p>
                  <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${printCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Remaining Time</p>
                <p className="text-lg font-medium">{remainingTime}</p>
              </div>
              {failureReason && (
                <div>
                  <p className="text-sm text-gray-400">Failure Reason</p>
                  <p className="text-lg font-medium text-red-400">{failureReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
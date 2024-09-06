import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Pause } from 'lucide-react';

const Dashboard = () => {
  const [viewDays, setViewDays] = useState(1);
  const [tempData, setTempData] = useState([]);
  const [printerStatus, setPrinterStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/bambu_status');
        const data = await response.json();
        setPrinterStatus(data);
        
        setTempData(prevData => {
          const newData = [...prevData, {
            time: new Date().toLocaleTimeString(),
            bedTemp: parseFloat(data.bedTemper),
            nozzleTemp: parseFloat(data.nozzleTemper)
          }];
          return newData.slice(-288 * viewDays); // Keep last 288 * viewDays points (5 min intervals for 1 or 7 days)
        });
      } catch (error) {
        console.error('Error fetching printer status:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [viewDays]);

  const formatXAxis = (tickItem) => {
    return viewDays === 1 ? tickItem : `Day ${Math.floor(tempData.indexOf(tickItem) / 288) + 1}`;
  };

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
                  tickFormatter={formatXAxis}
                  label={{ value: viewDays === 1 ? 'Time' : 'Days', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} 
                />
                <YAxis 
                  stroke="#9CA3AF"
                  label={{ value: 'Temperature (°C)', angle: -90, position: 'inside', fill: '#9CA3AF' }} 
                />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                <Legend verticalAlign='bottom' />
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
                <p className="text-lg font-medium">{printerStatus.subtask_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <div className="flex items-center space-x-2">
                  {printerStatus.gcodeState === 'RUNNING' && <CheckCircle className="text-green-400" />}
                  {printerStatus.gcodeState === 'PAUSE' && <Pause className="text-yellow-400" />}
                  {printerStatus.gcodeState === 'FAILED' && <AlertCircle className="text-red-400" />}
                  <p className="text-lg font-medium">{printerStatus.gcodeState || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Completion</p>
                <div className="flex items-center space-x-4">
                  <p className="text-2xl font-bold">{printerStatus.mcPercent || '0'}%</p>
                  <div className="flex-grow bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${printerStatus.mcPercent || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Remaining Time</p>
                <p className="text-lg font-medium">{printerStatus.mcRemainingTime ? `${printerStatus.mcRemainingTime} minutes` : 'N/A'}</p>
              </div>
              {printerStatus.failReason !== '0' && (
                <div>
                  <p className="text-sm text-gray-400">Failure Reason</p>
                  <p className="text-lg font-medium text-red-400">Error code: {printerStatus.failReason}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Current Temperatures</p>
                <p className="text-lg font-medium">
                  Bed: {printerStatus.bedTemper}°C / {printerStatus.bedTargetTemper}°C
                </p>
                <p className="text-lg font-medium">
                  Nozzle: {printerStatus.nozzleTemper}°C / {printerStatus.nozzleTargetTemper}°C
                </p>
                <p className="text-lg font-medium">
                  Chamber: {printerStatus.chamberTemper}°C
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
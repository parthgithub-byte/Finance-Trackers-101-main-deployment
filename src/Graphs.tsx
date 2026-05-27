import React, { useState, useEffect } from "react";

const Graphs: React.FC = () => {
  const availablePlots: string[] = ["bar", "pie", "line", "heatmap"];
  const [selectedPlot, setSelectedPlot] = useState<string>("all");
  const [plots, setPlots] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchPlots = () => {
      const updatedPlots: Record<string, string> = {};
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      
      availablePlots.forEach((type) => {
        updatedPlots[type] = `${API_BASE}/plot/${type}?t=${new Date().getTime()}`;
      });
      setPlots(updatedPlots);
    };

    fetchPlots();
    const interval = setInterval(fetchPlots, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center w-full p-4 bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Dropdown Selector */}
      <div className="mb-5">
        <label htmlFor="plotSelector" className="text-lg font-semibold">Select Chart Type:</label>
        <select 
          id="plotSelector"
          value={selectedPlot}
          onChange={(e) => setSelectedPlot(e.target.value)}
          className="ml-3 p-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">Show All Charts</option>
          {availablePlots.map((type) => (
            <option key={type} value={type}>{type.toUpperCase()} Chart</option>
          ))}
        </select>
      </div>

      {/* Display Selected Charts */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {selectedPlot === "all"
          ? availablePlots.map((type) => (
              <div key={type} className="w-full mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-center text-xl font-bold">{type.toUpperCase()} Chart</h2>
                <iframe 
                  src={plots[type]} 
                  className="w-full h-[500px] border-none rounded-md"
                  title={type} 
                />
              </div>
            ))
          : (
              <div className="w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-center text-xl font-bold">{selectedPlot.toUpperCase()} Chart</h2>
                <iframe 
                  src={plots[selectedPlot]} 
                  className="w-full h-[500px] border-none rounded-md"
                  title={selectedPlot} 
                />
              </div>
            )}
      </div>
    </div>
  );
};

export default Graphs;

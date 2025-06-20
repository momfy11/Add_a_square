import React, { useEffect, useState } from "react";
import Square from "./components/Square";
import { getRandomColor, findLastAddedColor, transformSquaresToColumns, addSquareToGridLayout} from "./helpers/squareHelpers";

// URL for backend API
const API_BASE_URL = "http://localhost:5000/api/square";

const PING_INTERVAL_MS = 2000;     // Ping server every 2 seconds
const FETCH_TIMEOUT_MS = 1000;     // Cancel fetch if no response in 1 second

function App() {
  // All possible colors for squares
  const colors = ["red", "green", "blue", "yellow", "purple", "pink", "cyan", "orange"];

  // App states
  const [columns, setColumns] = useState({}); // How squares are shown (grid)
  const [nextId, setNextId] = useState(1); // The next id to use
  const [unsyncedSquares, setUnsyncedSquares] = useState([]); // Squares not yet sent to backend
  const [isConnected, setIsConnected] = useState(true); // If server is online
  const [isSyncing, setIsSyncing] = useState(false); // If syncing is ongoing

  // Fetch all squares from backend at page load
  const fetchSquares = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      setIsConnected(response.ok);
      if (response.ok) {
        const squares = (await response.json()).sort((a, b) => a.id - b.id);
        const highestId = Math.max(...squares.map(s => s.id), 0);
        setNextId(highestId + 1);
        setColumns(transformSquaresToColumns(squares));
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Send one or more squares to server
  const addSquareToServer = async (square) => {
    try {
      const payload = Array.isArray(square) ? square : [square];
      for (const s of payload) {
        await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        });
      }
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };
  
  // Clear all squares in backend
  const resetSquaresOnServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset`, {
        method: "DELETE"
      });
      setIsConnected(response.ok);
      if (response.ok) {
        setColumns({});
        setNextId(1);
        setUnsyncedSquares([]);
        await fetchSquares();
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Add a new square, both visually and to backend (if online)
  const addSquare = async () => {
    if (isSyncing) return; // Don't allow adding while syncing

    // Try to sync offline squares first if possible
    if (isConnected && unsyncedSquares.length > 0) {
      await syncUnsyncedSquares();
    }

    // Find the color and the id for new square
    const lastColor = findLastAddedColor(columns);
    const usedIds = new Set([
      ...Object.values(columns).flat().map(s => s.id),
      ...unsyncedSquares.map(s => s.id)
    ]);

    let assignedId = Math.max(...usedIds, nextId);
    while (usedIds.has(assignedId)) assignedId++;

    const newSquare = { id: assignedId, color: getRandomColor(lastColor) };
    setNextId(assignedId + 1);

    // If online, send square to server, else store it locally for later
    if (isConnected) {
      await addSquareToServer(newSquare);
    } else {
      setUnsyncedSquares(prev => [...prev, newSquare]);
    }

    // Add square visually to grid
    setColumns(prev => addSquareToGridLayout(prev, newSquare));
  };

  // Tries to send all unsynced squares (created while offline) to the backend
  const syncUnsyncedSquares = async () => {
    try {
      // Mark sync as in progress (used for UI feedback and to block addSquare)
      setIsSyncing(true);

      // Build a list of all currently used IDs (from existing layout and from unsynced squares)
      const usedIds = new Set([
        ...Object.values(columns).flat().map(s => s.id),  // all IDs already rendered
        ...unsyncedSquares.map(s => s.id)                 // IDs waiting to be synced
      ]);

      // Start assigning IDs from the highest known + 1
      let currentId = Math.max(...usedIds, nextId) + 1;

      // Assign new (non-conflicting) IDs to each unsynced square
      const updatedSquares = unsyncedSquares.map(square => {
        // Skip over any already-used IDs
        while (usedIds.has(currentId)) {
          currentId++;
        }

        // Create a new square object with a safe unique ID
        const newSquare = { ...square, id: currentId++ };

        // Reserve the ID so it's not used again
        usedIds.add(newSquare.id);

        return newSquare;
      });

      // Send all updated squares to the server one-by-one
      await addSquareToServer(updatedSquares);

      // Update nextId to continue from the last used ID
      setNextId(currentId);

      // Clear the list of unsynced squares (they are now stored)
      setUnsyncedSquares([]);
    } catch (error) {
      // Log any error that occurred during sync
      console.error("Could not sync unsaved squares:", error);
    } finally {
      // Mark that syncing is finished (UI can update)
      setIsSyncing(false);
    }
  };


  // Ping server to check connection
  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(API_BASE_URL, { signal: controller.signal });
        if (isMounted) setIsConnected(response.ok);
      } catch {
        if (isMounted) setIsConnected(false);
      } finally {
        clearTimeout(timeout);
      }
    };

    checkConnection(); // initial ping on load
    const ping = setInterval(checkConnection, PING_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(ping);
    };
  }, []);

  // When server comes online, auto-sync all unsynced squares
  useEffect(() => {
    if (isConnected && unsyncedSquares.length > 0 && !isSyncing) {
      syncUnsyncedSquares();
    }
    // eslint-disable-next-line
  }, [isConnected]);


  // Load squares once on page load
  useEffect(() => {
    fetchSquares();
  }, []);



  return (
    <main className="flex flex-col items-center w-full bg-blue-500 text-white px-4 py-6">
      {/* Show connection status */}
      <div className="fixed top-4 right-4 flex items-center gap-2 p-2 bg-gray-800 rounded-md shadow-md">
        <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-white text-sm font-bold">
          {isConnected ? 'Connected' : 'No Connection To Server do not refresh the page'}
        </span>
        {isSyncing && (
          <div className="fixed top-4 left-4 p-2 bg-yellow-500 text-white font-bold rounded-md shadow-md animate-pulse">
            Syncing...
          </div>
        )}
      </div>

      {/* Main container */}
      <div className="flex flex-col mt-20 items-center min-h-screen w-full overflow-visible">
        {/* Buttons */}
        <div className="flex flex-row gap-4 mb-8">
          <button
            className="mt-4 px-4 py-2 bg-yellow-400 rounded-md text-white font-bold"
            onClick={addSquare}
            disabled={isSyncing}
          >
            Add square
          </button>
          <button
            className="mt-4 px-4 py-2 bg-red-400 rounded-md text-white font-bold"
            onClick={async () => {
              if (window.confirm("By resetting squares all squares will be removed permanently. \nAre you sure?")) {
                await resetSquaresOnServer();
              }
            }}
            
          >
            Clear Squares
          </button>
        </div>
        {/* Show the grid of squares */}
        <div className="flex justify-center">
          {Object.keys(columns).map((key) => (
            <div className="flex flex-col" key={key}>
              {columns[key].map((square) => (
                <Square
                  color={square.color}
                  isUnsynced={unsyncedSquares.some(u => u.id === square.id)}
                  key={square.id}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;

import { useState } from 'react';

export default function useVisualMode(initialMode) {
  // Keep track of mode as a stateful variable
  const [mode, setMode] = useState(initialMode);
  // Keep track of history as a stateful variable
  const [history, setHistory] = useState([initialMode]); 

  // function takes in a new mode and updates the mode state with the new value
  function transition(newMode, replace = false) {
    setMode(newMode);
    setHistory((prev) => {
      if (replace) {
        // Replace the previous mode with newMode
        return [...prev.slice(0, prev.length - 1), newMode];
      }
      //Otherwise, add newMode to the history
      return [...prev, newMode];
    });
  }

  // 
  function back() {
    setHistory((prev) => {
      // Only update history if there's more than one mode to go back to
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      // No change if already in initialMode
      return prev;
    });
  }

  // Return an object with the stateful variable
  return { mode: history[history.length - 1], transition, back };
}
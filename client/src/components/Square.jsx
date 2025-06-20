import React from "react";

/**
 * Square-komponenten representerar en enskild ruta i rutnätet.
 * @param {Object} props - Egenskaper som skickas till komponenten.
 * @param {string} props.color - Färgen som rutan ska ha.
 * @returns {JSX.Element} - En JSX-representation av rutan.
 */
function Square({ color, isUnsynced }) {
  return (
    <div
      className={`w-16 h-16 m-1 rounded-md shadow-md transition-all duration-300 ${isUnsynced ? 'ring-4 ring-red-400' : ''
        }`}
      style={{ backgroundColor: color }}
    ></div>
  );
}

export default Square;

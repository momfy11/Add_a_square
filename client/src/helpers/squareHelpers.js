
// All possible colors for squares
const colors = ["red", "green", "blue", "yellow", "purple", "pink", "cyan", "orange"];


// Pick a random color, but not the same as last one
  export const getRandomColor = (lastColor) => {
    let newColor;
    do {
      newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor === lastColor);
    return newColor;
};


// Find color of last added square
export const findLastAddedColor = (columns) => {
  let lastId = -1;
  let lastColor = null;
  Object.values(columns).forEach((column) => {
    column.forEach((square) => {
      if (square.id > lastId) {
        lastId = square.id;
        lastColor = square.color;
      }
    });
  });
  return lastColor;
};
  
// Adds a single new square into the existing column layout 
export const addSquareToGridLayout = (columns, newSquare) => {
  // Make a shallow copy of the current columns object to avoid mutating the original
  const updated = { ...columns };

  // Get all current column keys (e.g. ["0", "1", "2"])
  const columnKeys = Object.keys(updated);

  // Count how many columns exist currently
  const currentNumberOfColumns = columnKeys.length;

  // If there are no columns yet, start by creating column 0 and place the new square there
  if (currentNumberOfColumns === 0) {
    updated[0] = [newSquare];
  } else {
    // Get the number of squares in each column
    const columnHeights = columnKeys.map(key => updated[key].length);

    // Check if all columns have the same number of squares (perfect square layout)
    const isPerfectSquare = columnHeights.every(height => height === currentNumberOfColumns);

    if (isPerfectSquare) {
      // All columns are full → start a new column at the end
      updated[currentNumberOfColumns] = [newSquare];
    } else {
      // At least one column is shorter → find the one with the least squares
      const minColumnHeight = Math.min(...columnHeights);

      // Loop from right to left to place the square in the right-most shortest column
      for (let i = currentNumberOfColumns - 1; i >= 0; i--) {
        if (updated[i].length === minColumnHeight) {
          // Append the new square into that column
          updated[i] = [...updated[i], newSquare];
          break;
        }
      }
    }
  }

  // Return the updated layout
  return updated;
};

// Converts a flat list of squares into a structured grid layout (columns of squares)
export const transformSquaresToColumns = (squareList) => {
  const columns = {}; // This will hold the final column-based layout

  for (let i = 0; i < squareList.length; i++) {
    const square = squareList[i];
    const columnKeys = Object.keys(columns);
    const currentNumberOfColumns = columnKeys.length;

    // If there are no columns yet, start with the first one
    if (currentNumberOfColumns === 0) {
      columns[0] = [square];
      continue;
    }

    // Get the number of squares in each column
    const columnHeights = columnKeys.map((key) => columns[key].length);

    // If all columns have equal height, create a new column
    const isPerfectSquare = columnHeights.every(
      (height) => height === currentNumberOfColumns
    );

    if (isPerfectSquare) {
      columns[currentNumberOfColumns] = [square];
    } else {
      // Otherwise, find the rightmost column that has the fewest squares
      const minColumnHeight = Math.min(...columnHeights);
      for (let j = currentNumberOfColumns - 1; j >= 0; j--) {
        if (columns[j].length === minColumnHeight) {
          columns[j].push(square);
          break;
        }
      }
    }
  }

  return columns; // Return the structured columns object for rendering
};


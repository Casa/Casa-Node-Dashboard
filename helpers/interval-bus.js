// An object to contain intervals, in case they need to be cleared
const intervals = {};

// An object to store functions that will be called on intervals
const intervalFunctions = {};

// Supported intervals range from 10 seconds to 1 hour
const supportedIntervals = ['10', '30', '60', '90', '180', '300', '600', '900', '1800', '3600'];

// Loop through supported intervals to populate the actual interval objects
supportedIntervals.forEach(function(seconds) {
  intervals[seconds] = setInterval(function() { processInterval(seconds) }, parseInt(seconds) * 1000);
  intervalFunctions[seconds] = [];
});

// The value of "this" when calling an interval function
let intervalScope = false;

// Call every function in the array on each interval
function processInterval(seconds) {
  intervalFunctions[seconds].forEach(function(callback, index) {
    setTimeout(function() {
      if(intervalScope) {
        callback.call(intervalScope);
      } else {
        callback();
      }
    }, index * 1000); // Add a slight delay between each function call
  });
}

function isValidDuration(seconds) {
  if(intervals[seconds] !== undefined) {
    return true;
  }

  throw new Error('Invalid interval duration, supported intervals are: ' + supportedIntervals.toString());
}

function intervalFunctionExists(callback) {
  for(const [seconds, functions] of Object.entries(intervalFunctions)) {
    if(functions.indexOf(callback) > -1) {
      return seconds;
    }
  }

  return false;
}

// Loop through every duration of intervals and make sure this callback is removed
function clearIntervalFunction(callback) {
  for(const [seconds, functions] of Object.entries(intervalFunctions)) {
    if(functions.indexOf(callback) > -1) {
      intervalFunctions[seconds].splice(functions.indexOf(callback), 1);
    }
  }
}

// Public functions to control the interval bus
const IntervalBus = {
  scope(scope) {
    intervalScope = scope;
  },

  set(callback, seconds) {
    if(isValidDuration(seconds)) {
      // Does this function already exist? Remove it and re-add it with the new duration
      if(intervalFunctionExists(callback)) {
        clearIntervalFunction(callback);
      }

      intervalFunctions[seconds].push(callback);
    }
  },

  clear(callback) {
    if(intervalFunctionExists(callback)) {
      clearIntervalFunction(callback);
    }
  },

  // Helper function to pick the smallest interval that is greater than a given number of seconds
  // For example, if an API request takes approximately 44 seconds to complete, you'd want to use an interval of 60 seconds
  bestInterval(seconds, minimum = false) {
    // Select the largest interval by default
    let bestInterval = Math.max(...supportedIntervals);

    // Loop through supported intervals in descending order, without reorganzing the original array
    [...supportedIntervals].sort(function(a, b) {return b - a}).forEach(function(interval) {
      if(seconds < interval) {
        bestInterval = interval;
      }
    });

    // Is there a minimum interval? Is the current interval less than it?
    if(minimum && isValidDuration(minimum)) {
      if(bestInterval < minimum) {
        bestInterval = minimum;
      }
    }

    return bestInterval;
  },

  longestInterval() {
    return Math.max(...supportedIntervals);
  },
}

export default IntervalBus;

// Required export for testing
export { intervalFunctionExists };

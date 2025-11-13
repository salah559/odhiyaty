// cPanel Passenger startup file
// This file is the entry point for the application when hosted on cPanel

// Import the compiled server file
import('./dist/index.js').catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});

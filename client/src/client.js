/* -------------- Modules to be bundled via Webpack -------------- */

const io = require('socket.io-client');
const jsonParser = require('socket.io-json-parser');

/* -------------- Main Stuff -------------- */

// Declare globals
let states,
  buttons,
  dec,
  hex;

// Start when the DOM is fully loaded
window.onload = () => {

  // Only the server has knowledge of the specific pins used to wire each lightbulb.
  // But, the state of each pin can be represented using an array of 0's and 1's, and
  // each button on the user interface is indexed at the same position as the pins state here.
  // It is also assumed that each lightbulb is wired to each pin in this order as well.
  // The array will contain all 0's until the server sends the actual data.
  states = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  buttons = document.getElementsByClassName('button'); // The 8 buttons in the user interface
  dec = document.getElementById('decimal'); // Element containing the resulting binary -> decimal conversion
  hex = document.getElementById('hexadecimal'); // Element containing the resulting decimal -> hexadecimal conversion

  // Create a new socket connection to the server, and
  // switch the default data packet parser with an optimized JSON parser
  // since we're only receiving and sending arrays of numbers anyway.
  const socket = io({
    parser: jsonParser
  });

  // An 'update' event is emitted from the socket server each time the GPIO pin configuration 
  // changes on the Raspberry Pi, or the first time this socket client connects.
  socket.on('update', (data) => {
    updateUI(data);
  });

  // Add event listeners to the buttons
  for (let i = 0; i < 8; i += 1) {
    // Check if this client browser is any of these mobile devices via the userAgent string.
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Add a 'touchstart' event handler rather than 'click' so that you can tap on multiple buttons at a time
      buttons[i].addEventListener('touchstart', () => {
        console.log("Sent switch event for pin: " + i);
        socket.emit('switch', i);
      });

    } else {
      // Otherwise just add a 'click' event handler
      buttons[i].addEventListener('click', () => {
        console.log("Sent switch event for pin: " + i);
        socket.emit('switch', i);
      });

    }
  }

}; // End window.onload



/**
 * Accepts either a single index number or an array of GPIO pin states and updates the user interface based on the new data.
 * This function is called every time an 'update' event is received from the server. This event is received with an array as
 * data only once, when the client connects to the server. All other times, data will be a single number representing an index.
 * 
 * @param {number} data - A number from 0 to 7 representing the index of a pin which changed, corresponding to a button
 * @param {object} data - An array of numbers, either 0s or 1s, that represent the state of all pins, corresponding to all buttons
 */
function updateUI(data) {
  console.log(`Received a ${typeof data}: ${data}`);
  if (typeof data === 'number' && data >= 0 && data < 8) {
    // If we received a single number from 0 to 7, switch the state at that index
    if (states[data] === 0) {
      states[data] = 1;
    } else if (states[data] === 1) {
      states[data] = 0;
    }

  } else if (Array.isArray(data)) {
    // I we received an array of states, update the states array
    states = data;

  } else {
    console.log("Did not receive proper data.");
    return;
  }

  // Update the buttons in the user interface based on the new state(s)
  for (let i = 0; i < 8; i += 1) {
    if (states[i] === 1) {
      // If the pin state is 1 (HIGH) the button is on
      buttons[i].textContent = '1';
      buttons[i].style.backgroundColor = '#ffff66';
    } else if (states[i] === 0) {
      // If the pin state is 0 (LOW) the button is off
      buttons[i].textContent = '0';
      buttons[i].style.backgroundColor = 'white';
    }
  }

  // Update the conversions in the user interface based on the new state(s)
  let decimal = binaryToDecimal(states);
  dec.textContent = decimal;
  let hexadecimal = decimalToHexadecimal(decimal);
  hex.textContent = '#' + hexadecimal;
  document.body.style.backgroundColor = '#' + hexadecimal.repeat(3);

} // End updateUI



/**
 * Convert a binary (base-2) number into a decimal (base-10) number.
 * 
 * @param {object} binaryArray - A binary number represented as an array of 0's or 1's, the state of the pins
 * @returns a decimal value number
 */
function binaryToDecimal(binaryArray) {
  let digits = Array.from(binaryArray).reverse();

  return digits.reduce((accumulator, current, currentIndex) => {
    if (digits[currentIndex] === 0)
      return accumulator;
    else if (digits[currentIndex] === 1)
      return Math.pow(2, currentIndex) + accumulator;
  }, 0);

} // End binaryToDecimal



/**
 * Convert a decimal (base-10) number into a hexadecimal (base-16) number 
 * 
 * @param {number} decimal - A decimal number, just an integer
 * @returns a hexadecimal value number represented as a string, padded to 2 digits
 */
function decimalToHexadecimal(decimal) {
  let hexVal = decimal.toString(16).toUpperCase();
  if (hexVal.length < 2) hexVal = '0' + hexVal;

  return hexVal;

} // End decimalToHexadecimal
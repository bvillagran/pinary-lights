const Gpio = require('onoff').Gpio;

/* ---------------------------- SPECIFY WHICH PINS TO USE HERE ---------------------------- */

// In this implementation, the correct way to read the array of BCM GPIO pins is from left to right where:
// the left-most pin number (pins[0]) refers to the pin connecting to the left-most lightbulb representing the numeric value 2^7 and
// the right-most pin number (pins[7]) refers to the pin connecting to the right-most lightbulb representing the numeric value 2^1
const pins = [2, 3, 4, 14, 15, 0, 5, 6];

/* ---------------------------------------------------------------------------------------- */

// Use the pin numbers to create new gpio objects to interface with
const gpioPins = pins.map(number => new Gpio(number, 'out'));

/**
 * Asynchronously reads the state of all BCM GPIO pins specified by the 'pins' array
 * 
 * @returns a promise which resolves to an array of numbers, either 0 or 1, representing the state of the pin at the corresponding index
 */
function readAll() {
    return new Promise((resolve, reject) => {
        let readings = [];
        for (let i = 0; i < 8; i += 1) {
            readings.push(readState(i));
        }

        Promise.all(readings)
            .then(states => resolve(states))
            .catch(err => reject(err));
    });
}

/**
 * Asynchronously reads the state of a pin.
 * 
 * @param {number} index - The index of a pin in 'pins' whose state to read
 * @returns a promise that resolves to the value of the state read: 0 or 1
 */
function readState(index) {
    return new Promise((resolve, reject) => {
        gpioPins[index].read((err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
}

/**
 * Asynchronously switches the state of a pin.
 * 
 * @param {number} index - The index of a pin in 'pins' whose state will be switched
 * @returns a promise that resolves when the state was successfully switched
 */
function switchState(index) {
    return new Promise((resolve, reject) => {
        gpioPins[index].read((err, value) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Pin ${pins[index]} switched`);
                resolve(gpioPins[index].write(value ^ 1, (err) => reject(err)));
            }
        });
    });
}

module.exports = {
    readAll,
    readState,
    switchState,
    test() {
        // Conveniently test this module without setting up a server.
        // Will test on the 4th pin (position 3) in the 'pins' array.
        readAll().then(state => console.log(state));
        switchState(3)
            .then(() => {
                readAll()
                    .then(state => console.log(state));
            })
            .catch(err => console.log("\nError: " + err));
    }
};
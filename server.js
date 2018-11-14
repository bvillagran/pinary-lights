// Set up the HTTP server which will serve the client files.
const serveStatic = require('serve-static')('client/dist');
const http = require('http').createServer(serveStatic);

// Set up the Socket.io server, using the HTTP server and replacing the default parser with an
// optimized JSON parser since we'll only be sending single numbers or arrays anyway.
const jsonParser = require('socket.io-json-parser');
const io = require('socket.io')(http, {
    parser: jsonParser
});

// Set up the gpio module which handles all interaction with the pins.
// Go there to change the specific BCM GPIO pins wired in the project
const gpio = require('./gpio');

// Do stuff when a new client connects to the socket server
io.on('connection', (socket) => {
    console.log(`\nUser ${socket.id} connected.`);
    
    // First time a user connects, send the state of all GPIO pins
    gpio.readAll().then((states) => {
        console.log(`\nSending current GPIO configuration.\n[${states}]`);
        socket.emit('update', states);
    }).catch((err) => {
        console.log(err);
    });

    // When a client sends a 'switch' event with an index number,
    // switch the state of the corresponding pin.
    socket.on('switch', (index) => {
        console.log("\nSwitch event received.");
        gpio.switchState(index).then(() => {
            // Emit the 'update' event with the index to all clients
            io.emit('update', index);
        });
    });

    // Do something when a client disconnects
    socket.on('disconnect', () => {
        console.log(`\nUser ${socket.id} disconnected.`);
    });

});

// Get the local IPv4 address the server should be reached at.
// NOTE: This line is very dependent on the configuration of the system and thus,
// the output of the functions in the 'os' module. Changes may need to be made.
let localAddress = require('os').networkInterfaces().wlan0[0].address;

// Start the server on port 3000
http.listen(3000, () => {
    console.log(`Server listening on http://${localAddress}:3000`);
});


# Pi-nary Lights
This is a reimplementation of an older school project, previously called Binary Lights Illuminated. The old version used an Apache server and server-side PHP scripts to interact with the GPIO pins on the Pi. But my implementation suffered from horrendous lag when multiple users tried interacting with it, so I decided to redo the whole project but this time using a Node server and Socket.IO.

**Basically**, the project as a whole is meant to be used to teach the binary number system to an audience. The Node server hosted on a Raspberry Pi serves a simple client interface to devices on the same local network and establishes a two-way socket connection via Socket.IO. The client interface involves 8 buttons, each representing a binary digit or 1 byte. The buttons will change depending on the state of the GPIO pins and therefore the states of the wired lightbulbs/LEDs. Additionally, the client interface takes the binary value and converts it to decimal and hexadecimal values and changes the background to the corresponding 8-bit greyscale color.

The client and the server interact over the Socket.IO interface. When a client connects, the server will send the current state of each GPIO pin and the client interface will update to represent it. When a button is clicked or tapped, the client tells the server to switch the state of the corresponding pin, and the server will broadcast that change to all connected clients. The pin changing will also be reflected in the state of the corresponding lightbulb/LED changing from on to off or vice-versa.


# How To
This project not only serves to be an upgrade from the original, but also a learning experience for me in using Node and Socket.IO. As such, I encourage beginner to intermediate JavaScript programmers who also want to learn how to use Node on a Raspberry Pi to create cool home-automation style projects, to clone this repo and set up the project at home. I try to heavily comment my code to help guide you through it. But if you still find yourself confused, you can check out the relevant API documentation:
* [Node.js](https://nodejs.org/api/ "Node API Documentation")
* [Socket.IO Server](https://socket.io/docs/server-api/ "https://socket.io/docs/server-api/")
* [Socket.IO Client](https://socket.io/docs/client-api/ "https://socket.io/docs/client-api/")
* [onoff (Node GPIO package)](https://www.npmjs.com/package/onoff "https://www.npmjs.com/package/onoff")
* [serve-static (Node static file server package)](https://www.npmjs.com/package/serve-static "https://www.npmjs.com/package/serve-static")
* [Webpack](https://webpack.js.org/guides/getting-started/ "https://webpack.js.org/guides/getting-started/")



## Installation & Setup
### Requirements:
* Raspberry Pi Model 3 - Haven't tested on older models but you're welcome to try! onoff also has support for other microcontrollers.
* Raspbian installed - Tested on a clean install of Raspbian Stretch Full Version (2018-11-13).
* Node installed - I used 11.2.0 (latest version at the time of this edit) installed via [nvm](https://github.com/creationix/nvm "https://github.com/creationix/nvm"), but you should be able to use any version that supports ES6 (ES2015) features.
* Something to let you SSH into the Raspberry Pi if you like. My main machine is on Windows 10 so I used the ssh command provided in some terminals such as Git Bash or [Cmder](https://github.com/cmderdev/cmder "https://github.com/cmderdev/cmder"). [PuTTY](https://www.ssh.com/ssh/putty/download "https://www.ssh.com/ssh/putty/download") is another popular option.
* 8 Lightbulbs or LEDs and a way to connect them to the GPIO interface on the Raspberry Pi board (I don't provide instructions on how to do this here, but there are plenty of tutorials online and YouTube videos to help you do it).

### Lightbulb/LED Setup:
The project assumes you have 8 lightbulbs or LEDs connected to 8 GPIO pins on your Raspberry Pi. The exact pins I used are (BCM) 2, 3, 4, 14, 15, 0, 5, 6 and this can be found and changed in the [gpio.js](https://github.com/bvillagran/pinary-lights/blob/master/gpio.js) file. Additionally, you may need to set the `activeLow` option for the gpioPin objects in [gpio.js](https://github.com/bvillagran/pinary-lights/blob/master/gpio.js) if you are wired to a relay module for some higher voltage lightbulbs (see the [onoff package](https://www.npmjs.com/package/onoff "https://www.npmjs.com/package/onoff")  on how to do that).

The order of the pins and the lightbulbs are very important. The array of pins found in [gpio.js](https://github.com/bvillagran/pinary-lights/blob/master/gpio.js) assumes that the corresponding lightbulbs are ordered the same way.

### Server Setup:
I did this in the default home directory of the Raspberry Pi: `/home/pi/`. Replace `pi` with your user if you have a different one. In the terminal run:

* `git clone https://github.com/bvillagran/pinary-lights.git`
* `cd pinary-lights`**\***
* `npm install`
* `npm run build`
* `npm start`

**\*** at this point you may have to change line 48 in [server.js](https://github.com/bvillagran/pinary-lights/blob/master/server.js), I recommend testing that command in the Node REPL, or to avoid that all together just hardcode your Pi's IPv4 address if you know it. Also you can change the pins array in [gpio.js](https://github.com/bvillagran/pinary-lights/blob/master/gpio.js) if you would like to use different pins.
### Optionally Configure Autostart with PM2 (Recommended):
* `npm install -g pm2`
* `pm2 startup`
* copy, paste, and run the command it gives you
* move into your project directory, e.g. `cd ~/pinary-lights/`
* `pm2 start server.js`
* check that it's in the process list with `pm2 ls`
* `pm2 save`

Your server should now be set to run on startup and every time you reboot your Pi. You may want to test it to make sure it works everytime. For more information visit the [pm2 docs](https://pm2.io/doc/en/runtime/overview/ "https://pm2.io/doc/en/runtime/overview/").

#

## Connect
Your Pi terminal should spit out the local IPv4 address your server can be reached. But if it doesn't or the server crashes, check line 48 in [server.js](https://github.com/bvillagran/pinary-lights/blob/master/server.js) again and make adjustments as needed. You can also find your Pi's IPv4 address in your home router settings.

Once you have the address, open up a web browser on any locally connected device (internet isn't required, you just need to be on the same local network) and type in the url the server gives, which should just be your Pi's IPv4 address and port 3000. 

For example, the Pi terminal will read something like: `Server listening on http://10.0.0.8:3000` and you just copy and paste the url or manually look for it's address yourself and type it in. Once you've opened up the interface and all is connected properly, go nuts! Press the buttons and see what happens. If you are on a mobile device like a smartphone or tablet (but not laptop) you should be able to tap more than one button at a time, you can check out the client-side code for that dirty trick.

#

## Troubleshoot
* If you aren't using the default Pi user, make sure that your user is added to the `gpio` user group.
* Make sure you are using a version of Node that supports ES6 features.
* You may run into issues if you have multiple versions of Node installed, make sure you are using the same version throughout the whole process.
* If you find issues specifically with your GPIO pins, you can test them with the [WiringPi](http://wiringpi.com/the-gpio-utility/ "http://wiringpi.com/the-gpio-utility/") gpio utility that usually comes preinstalled with Raspbian, or manually install it. The utility allows you to send commands to your GPIO interface through the terminal without writing a script to do it. One note I'll make here is to pass the `-g` flag to your commands to make sure you are using the same numbering scheme (BCM) as the project.
* I will add more things here as I find out about more issues.

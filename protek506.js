const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const prompt = require('prompt');

var promise = SerialPort.list().then(function(ports) {
    valid_ports = [];
    ports.forEach(function(port) {
        if(!port.vendorId) return;
        valid_ports.push(port.path);
        console.log('[' + valid_ports.length + "] " + port.path + " (" + port.manufacturer + ")");
    });

    if(!valid_ports.length) {
        console.log("No Serial ports found. Exiting.");
        process.exit();
    }

    prompt.start();

    prompt.get(['port'], function (err, result) {
        if (err) { return onErr(err); }
        console.log('Command-line input received:');
        console.log('  port: ' + result.port);
        const port = new SerialPort(valid_ports[result.port - 1], { baudRate: 1200, dataBits: 7, stopBits: 2});
        _port = port;
        const parser = new Readline({ delimiter:'\r' });
        port.pipe(parser);
        parser.on('data', function(data) { parserOnData(data, port)});
        port.on('open', portOnOpen);
        port.on('error', portOnError);
    });

});

function onErr(err) {
    console.log(err);
    return 1;
}

async function parserOnData(data, port) {
    process.stdout.write("\r" + data + "      ");
}

function portOnError(err) {
    console.log(err);
}

function portOnOpen() {
    console.log("Port is open");
    var port = this;
    setInterval(function() {trigger(port)}, 500);
}

function trigger(port) {
    port.flush();
    port.write('\n');
}
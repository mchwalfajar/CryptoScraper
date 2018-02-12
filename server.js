const https = require('https');
const http = require('http');
const {exec} = require('child_process');
var url = 'https://api.coindesk.com/v1/bpi/currentprice.json';
var blockchain = 'https://blockchain.info/ticker';
var coinbase = 'https://api.coinbase.com/v2/prices/BTC-USD/buy';
var coinbases = 'https://api.coinbase.com/v2/prices/BTC-USD/sell';
var influx = 'https://10.0.0.21:8086/write?db=bitcoin';

var hostname = "10.0.0.21";
var portnum = 8086;

var opt = {
	host: 'https://10.0.0.21',
	port: 8086,
	path: '/write?db=cointesting',
	method: 'GET',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
};

function influxIt(measurement, value){
	var data = measurement + " value=" + value;
	var opt = {
		host: hostname,
		port: portnum,
		path: '/write?db=cointesting',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data)
		}
	};

	const req = http.request(opt, (res) => {
	});
	req.write(data);
	req.end();
}

function logData(){
	
	https.get(coinbases, (resp) => {
		let data = '';
		resp.on('data', (chunk) =>{
			data += chunk;
		});

		resp.on('end', () =>{
			var price = JSON.parse(data).data.amount;
			influxIt("coinbasesell", price);
		});
		}).on("error", (err) => {
			console.log("Some error: " + err.message);
	});

	https.get(coinbase, (resp) => {
		let data = '';
		resp.on('data', (chunk) =>{
			data += chunk;
		});

		resp.on('end', () =>{
			var price = JSON.parse(data).data.amount;
			influxIt("coinbasebuy", price);
		});
		}).on("error", (err) => {
			console.log("Some error: " + err.message);
	});

	https.get(blockchain, (resp) => {
		let data = '';
		resp.on('data', (chunk) =>{
			data += chunk;
		});

		resp.on('end', () =>{
			var price = JSON.parse(data).USD.last;
			var dp = JSON.parse(data).USD['15m'];
			//console.log("Blockchain price: " + price);
			influxIt("blockchain", price);		
		});
		}).on("error", (err) => {
			console.log("Some error: " + err.message);
	});
	
	https.get(url, (resp) => {
		let data = '';
		resp.on('data', (chunk) =>{
			data += chunk;
		});

		resp.on('end', () =>{
			//console.log(JSON.parse(data).bpi.USD.rate_float);
			var price = JSON.parse(data).bpi.USD.rate_float;
			influxIt("coindesk", price);
			
		});
	}).on("error", (err) => {
		console.log("Some error: " + err.message);
	});
}

setInterval(logData, 5000);

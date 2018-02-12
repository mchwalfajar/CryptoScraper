const https = require('https');
const {exec} = require('child_process');
var url = 'https://api.coindesk.com/v1/bpi/currentprice.json';
var blockchain = 'https://blockchain.info/ticker';
var coinbase = 'https://api.coinbase.com/v2/prices/BTC-USD/buy';
var coinbases = 'https://api.coinbase.com/v2/prices/BTC-USD/sell';
var influx = 'https://10.0.0.21:8086/write?db=bitcoin';

var opt = {
	host: 'https://10.0.0.21',
	port: 8086,
	path: '/write?db=bitcoin',
	method: 'GET',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded'
	}
};

function logData(){
	
	https.get(coinbases, (resp) => {
		let data = '';
		resp.on('data', (chunk) =>{
			data += chunk;
		});

		resp.on('end', () =>{
			var price = JSON.parse(data).data.amount;
			exec("curl -i -XPOST 'http://10.0.0.21:8086/write?db=bitcoin' --data-binary 'coinbasesell value="+price+"'", (err, stdout, stderr) =>{
				if(err){
					console.log("error " + err.message);
				}
			});		
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
			exec("curl -i -XPOST 'http://10.0.0.21:8086/write?db=bitcoin' --data-binary 'coinbasebuy value="+price+"'", (err, stdout, stderr) =>{
				if(err){
					console.log("error " + err.message);
				}
			});		
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
			exec("curl -i -XPOST 'http://10.0.0.21:8086/write?db=bitcoin' --data-binary 'blockchainlast value="+price+" \n blockchain15m value="+dp+"'", (err, stdout, stderr) =>{
				if(err){
					console.log("error " + err.message);
				}
			});		
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
			//console.log("coindesk price: " + price);
			exec("curl -i -XPOST 'http://10.0.0.21:8086/write?db=bitcoin' --data-binary 'coindeskprice value="+price+"'", (err, stdout, stderr) =>{
			//exec("curl -i -XPOST \'" + influx + "\' --data-binary \'coindesk-price value=" + price + "\'", (err, stdout, stderr) =>{
				if(err){
					console.log("Error " + err.message);
				}
			});  
			
		});
	}).on("error", (err) => {
		console.log("Some error: " + err.message);
	});
}

setInterval(logData, 5000);

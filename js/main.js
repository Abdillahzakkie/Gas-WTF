const connectBtn = document.querySelector(".connect-btn");
const gasSpentInEth = document.querySelector("#gasSpentInEth");
const totatGasUsedd = document.querySelector("#totatGasUsed");
const totaltsx = document.querySelector("#totaltsx");
const failedtxs = document.querySelector("#failedtxs");
const failedGasInEth = document.querySelector("#failedGasInEth");
const gwei = document.querySelector("#gwei");

const apiKey = "7QEMXYNDAD5WT7RTA5TQUCJ5NIA99CSYVI";

async function fetchapi(address, current) {
	try {
		const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=${current}&sort=asc&apikey=${apiKey}`;
		const res = await fetch(url);
		return await res.json();
	} catch (err) {
		console.log(err);
		return err;
	}
}

async function getGas() {
	try {
		const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`;
		const res = await fetch(url);
		return await res.json();
	} catch (err) {
		console.log(err);
		return err;
	}
}

async function averageGasPrice() {
	let { result } = await getGas();
	let average =
		(Number(result.SafeGasPrice) +
			Number(result.ProposeGasPrice) +
			Number(result.FastGasPrice)) /
		3;
	return average.toFixed(1);
}

async function loadMetaMask() {
	try {
		if (!ethereum)
			return alert(
				"Non-Ethereum browser detected. You should consider trying Metamask"
			);
		const Web3 = window.Web3;
		var web3 = new Web3(ethereum);
		let block = await web3.eth.getBlockNumber();
		let user;

		const _accounts = await ethereum.request({ method: "eth_requestAccounts" });
		user = web3.utils.toChecksumAddress(_accounts[0]);
		return {
			block,
			user,
		};
	} catch (err) {
		console.log(err);
	}
}

// testing
function convertToInternationalCurrencySystem(labelValue) {
	// Nine Zeroes for Billions
	return Math.abs(Number(labelValue)) >= 1.0e9
		? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(2) + " Billion"
		: // Six Zeroes for Millions
		Math.abs(Number(labelValue)) >= 1.0e6
		? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(2) + " Million"
		: // Three Zeroes for Thousands
		Math.abs(Number(labelValue)) >= 1.0e3
		? (Math.abs(Number(labelValue)) / 1.0e3).toFixed(2) + " K"
		: Math.abs(Number(labelValue));
}

const EthPrice = async () => {
	try {
		const url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`;
		const res = await fetch(url);
		let data = await res.json();
		return data.ethereum.usd;
	} catch (err) {
		console.log(err);
	}
};

async function main() {
	let { user, block } = await loadMetaMask();
	connectBtn.textContent = "Connected";

	let data = await fetchapi(user, block);
	let txtMadeByAddress = 0;
	let totalGasSpent = 0;
	let totalGasUsed = 0;
	let numberOfFailedTxs = 0;
	let failedGasSpent = 0;
	for (let i = 0; i < data.result.length; i++) {
		const element = data.result[i];
		if (element.from == user.toLowerCase()) {
			txtMadeByAddress++;
			totalGasSpent +=
				(Number(element.gasPrice) * Number(element.gasUsed)) / 10 ** 18;
			totalGasUsed += Number(element.gasUsed);
			if (element.isError == 1) {
				numberOfFailedTxs++;
				failedGasSpent += (element.gasPrice * element.gasUsed) / 10 ** 18;
			}
		}
	}
	let sucessTxs = txtMadeByAddress - numberOfFailedTxs;

	// getting the average gas price
	let average = await averageGasPrice();
	let priceEth = await EthPrice();

	failedGasInEth.innerHTML = `E ${failedGasSpent.toFixed(3)} ($${(
		failedGasSpent * priceEth
	).toFixed(3)})`;
	gasSpentInEth.innerHTML = `E ${totalGasSpent.toFixed(3)} ($${(
		totalGasSpent * priceEth
	).toFixed(3)})`;
	totatGasUsedd.innerHTML = convertToInternationalCurrencySystem(totalGasUsed);
	totaltsx.innerHTML = txtMadeByAddress;
	failedtxs.innerHTML = numberOfFailedTxs;
	gwei.innerHTML = average;
}

// window.addEventListener("DOMContentLoaded", async () => await main());

connectBtn.addEventListener("click", async () => await main());

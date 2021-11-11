import registerPromiseWorker from "promise-worker/register";
// import { abi } from "../../../build/contracts/ERC777.json";
import { moveDecimal } from '../utils'
import { default as sdk } from "js-conflux-sdk";

function signTx({ txOptions, privateKey, chainId } = {}) {
  let tmpTx = new sdk.Transaction(txOptions);
  tmpTx.sign(privateKey, chainId);
  return tmpTx.serialize();
}

function getDrip({cfx, decimals} = {}) {
  // console.log(cfx, decimals)
  const deltaDecimal = 18 - decimals;
  let drip = sdk.Drip.fromCFX(moveDecimal(cfx, -deltaDecimal)).toString()
  // console.log(drip)
  return drip
}

registerPromiseWorker(function(message) {
  // console.log(message)
  switch (message.type) {
    case "sign":
      return signTx(message.data);
    case "getDrip":
      return getDrip(message.data);
  }
  return "pong";
});

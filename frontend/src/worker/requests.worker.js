import registerPromiseWorker from "promise-worker/register";
// import { abi } from "../../../build/contracts/ERC777.json";

import { default as sdk } from "js-conflux-sdk";

function signTx({ txOptions, privateKey, chainId } = {}) {
  let tmpTx = new sdk.Transaction(txOptions);
  tmpTx.sign(privateKey, chainId);
  return tmpTx.serialize();
}

registerPromiseWorker(function(message) {
  // console.log(message)
  switch (message.type) {
    case "sign":
      return signTx(message.data);
  }
  return "pong";
});

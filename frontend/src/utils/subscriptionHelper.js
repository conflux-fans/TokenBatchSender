function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executed(conflux, transactionHash, { delta = 1000, timeout = 5 * 60 * 1000 } = {}) {
  const startTime = Date.now();
  for (let lastTime = startTime; lastTime < startTime + timeout; lastTime = Date.now()) {
    const receipt = await conflux.getTransactionReceipt(transactionHash);
    if (receipt) {
      if (receipt.outcomeStatus !== 0) {
        throw new Error(`transaction "${transactionHash}" executed failed, outcomeStatus ${receipt.outcomeStatus}`);
      }
      return receipt;
    }

    await sleep(lastTime + delta - Date.now());
  }

  throw new Error(`wait transaction "${transactionHash}" executed timeout after ${Date.now() - startTime} ms`);
}

async function confirmed(conflux, transactionHash, { delta = 1000, timeout = 30 * 60 * 1000, threshold = 1e-8 } = {}) {
  const startTime = Date.now();

  for (let lastTime = startTime; lastTime < startTime + timeout; lastTime = Date.now()) {
    const receipt = await executed(conflux, transactionHash, { delta, timeout }); // must get receipt every time, cause blockHash might change
    const risk = await conflux.getConfirmationRiskByHash(receipt.blockHash);
    if (risk <= threshold) {
      return receipt;
    }

    await sleep(lastTime + delta - Date.now());
  }

  throw new Error(`wait transaction "${transactionHash}" confirmed timeout after ${Date.now() - startTime} ms`);
}

export {
  executed,
  confirmed
}

import { BATCHLIMIT } from "./const"

class BatchRequesterWrapper {
  constructor(batcher) {
    this.batcher = batcher
    this.BATCHLIMIT = BATCHLIMIT
  }

  // we could only process read requests now
  async execute() {
    let results = []
    let requests = this.batcher.requests
    // console.log(requests)
    for (let i =0; i < requests.length; i+=this.BATCHLIMIT) {
      const tmp_result = await this.batcher.conflux.provider.batch(requests.slice(i, i + this.BATCHLIMIT))
      // console.log(tmp_result)
      results = results.concat(tmp_result)
    }
    return results
  }
}

function isHash(obj) {
  if (typeof obj === 'string') {
    return true
  }
  return false
}

function countInvalidResults(results) {
  let count = 0;
  results.forEach(element => {
    if (typeof element !== 'string') {
      count += 1
    }
  });
  return count
}

// function mergeResults(results, auxResults) {
//   if (results.length !== auxResults.length) {
//     throw new Error("Results and anxResults should share same length")
//   }
//   for (let i = 0; i < results.length; ++i) {
//     if (typeof results[i] !== 'string') {
//       if (typeof auxResults[i] === 'string') {
//         results[i] = auxResults[i]
//       }
//     }
//   }
// }

function mergeResults(results, auxResults) {
  if (countInvalidResults(results) !== auxResults.length) {
    throw new Error("Invalid results and anxResults should share same length")
  }
  let index = 0 
  for (let i = 0; i < results.length; ++i) {
    if (!isHash(results[i])) {
      results[i] = auxResults[index];
      index += 1;
    }
  }
}

function selectRequests(allReqs, results) {
  let sReqs = []
  if (allReqs.length !== results.length) {
    throw new Error("requests length should be equal to results length")
  }
  for (let i = 0; i < allReqs.length; ++i) {
    if (!isHash(results[i])) {
      sReqs.push(allReqs[i])
    }
  }
  return sReqs
}

// function isAllAccepted(auxResults) {
//   for (let result of auxResults) {
//     if (typeof result === 'string' || result ?.code == ) {
//       return false
//     }
//   }
// }

export {
  BatchRequesterWrapper,
  countInvalidResults,
  mergeResults,
  selectRequests
}

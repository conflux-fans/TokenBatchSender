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
      const tmp_result = await this.batcher.provider.batch(requests.slice(i, i + this.BATCHLIMIT))
      // console.log(tmp_result)
      results = results.concat(tmp_result)
    }
    return results
  }
}


export {
  BatchRequesterWrapper
}

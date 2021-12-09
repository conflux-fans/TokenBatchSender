import { BigNumber } from "bignumber.js";


function preciseSum(arr) {
  return BigNumber.sum(...arr).toString()
}

function moveDecimal(num, deltaDecimal) {
  let rtn = new BigNumber(num);

  if (deltaDecimal >= 0) {
    for (let i = 0; i < deltaDecimal; ++i) {
      rtn.times(10)
    }
  } else {
    for (let i = 0; i < -deltaDecimal; ++i) {
      rtn.dividedBy(10)
    }
  }
  return rtn.toString()
}

export {
  preciseSum,
  moveDecimal,
}

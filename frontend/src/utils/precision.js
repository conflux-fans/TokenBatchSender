import NP from 'number-precision'

function preciseSum(arr) {
  return arr.reduce((x, y) => NP.plus(x, y), 0)
}

function moveDecimal(num, deltaDecimal) {
  let rtn = num;

  if (deltaDecimal >= 0) {
    for (let i = 0; i < deltaDecimal; ++i) {
      rtn = NP.times(rtn, 10)
    }
  } else {
    for (let i = 0; i < -deltaDecimal; ++i) {
      rtn = NP.divide(rtn, 10)
    }
  }
  return rtn
}

export {
  preciseSum,
  moveDecimal,
}

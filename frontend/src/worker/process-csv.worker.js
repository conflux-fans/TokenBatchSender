import { default as sdk } from 'js-conflux-sdk'
import { parse } from 'papaparse'
import { NetworkType } from '../enums'
import registerPromiseWorker from "promise-worker/register";

function parseCsv(data) {
  const { text, chainId } = data
  const rows = parse(text).data

  let tos = [];
  let vals = [];
  let csv_msg = []

  for (let i = 0; i < rows.length; ++i) {
    const results = rows[i];

    // 空行，会跳过其他判断直接进行下一行的处理
    if (results.length === 1 && !results[0]) {
      continue
    }

    // 对每一行都进行错误检查 最后将所有行的错误一起抛出
    try {
      if (results.length !== 2) {
        throw new Error('column count is not 2')
      }

      const addr = results[0].trim()
      const val = results[1].trim()

      // 对标题行的判断
      if (i === 0) {
        if(addr === 'address' && val === 'amount') {
          continue
        }
      }

      if (!NetworkType.isValidAddress(addr, chainId, sdk)) {
        throw new Error(`Address is not valid for current network: ${addr}`)
      }
      
      if (addr.startsWith("0x")){
        if (!addr.startsWith("0x1") && !addr.startsWith('0x8') && !addr.startsWith('0x0')) {
          throw new Error(`A valid conflux hex address is expected to start with 0x0, 0x1, or 0x8`)
        }
      }

      if (isNaN(val)) {
        throw new Error(`Unexpected value: ${val} is not a number`)
      }
      if (val <= 0) {
        throw new Error(`Transfer amount should be greater than zero: ${val}`)
      }

      tos.push(sdk.format.address(addr, parseInt(chainId)));
      vals.push(parseFloat(val));
      
    } catch (e) {
      csv_msg.push(`ERROR: CSV ROW ${i+1} - ${e.message}`)
    }
  }

  if(csv_msg.length !== 0) {
    throw new Error(csv_msg.join("\n"))
  }
  return {
    csv: {
      tos,
      vals
    }
  }
}

registerPromiseWorker(function(message) {
  // console.log(message)
  // switch (message.type) {
  //   case "sign":
  //     return signTx(message.data);
  //   case "getDrip":
  //     return getDrip(message.data);
  // }
  // return "pong";
  return parseCsv(message.data)
});

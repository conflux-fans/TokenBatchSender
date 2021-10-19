import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const messages = {
  en: {
    message: {
      title: "Conflux Token Batch Sender",
      selectToken: 'Select Token',
      selectText: "Click or type to select token",
      connect: 'Connect',
      onRequest: "Requesting...",
      currentAccountAddress: 'Current Account Address',
      toConfluxScan: 'Go to ConfluxScan',
      latestOperationStatus: 'Latest Operation Status',
      ok: 'OK',
      cancel: 'cancel',
      token: 'Token',
      address: 'Address',
      tokenBalance: 'Balance',
      decimals: 'Decimals',
      operationType: 'Operation',
      tokenAmount: 'Amount',
      transactionHash: 'Transaction Hash',
      operator: 'Operator',
      sender: 'Sender',
      tokenContractAddress: 'Token Address',
      currentTransactionStatus: 'Current Transaction Status',
      transferSum: 'Sum',
      transferCount: 'Count',
      historyTransactions: 'History Transactions',
      command: {
        clearHistory: 'CLEAR HISTORY',
        resetCsv: 'RESET CSV',
        send: 'SEND',
        sendInDirectSendingMode: 'SEND in Compatible Mode',
        uploadSecretKey: 'SELECT SECRET KEYSTORE FILE'
      },
      error: {
        networkError: 'Network Error',
        error: "ERROR",
        transactionError: 'Transaction Error',
        installationError: 'ConfluxPortal Not Detected',
      },
      warning: {
        connectionWarning: 'Please connect to your wallet',
        tokenWarning: 'Please select token',
        changeNetworkWarning: 'Please change network to Conflux Testnet in Conflux Poral, and then manually refresh page',
        clearHistory: 'All history transactions will be deleted, are you sure?',
      },
      tooltip: {
        networkTooltip: 'Change network in ConfluxPortal',
        portal: {
          beg: "Chrome extension ",
          end: " is required for Conflux Testnet Faucet",
        },
        executed: 'Transaction is executed, but not confirmed yet.',
        historyTransactions: 'Transaction info is saved only after confirmation. These data will not be uploaded to any server',
        csv: {
          drag: 'Drag CSV here, or ',
          clickToUpload: 'click to upload',
          resolve: 'Accepted: .csv',
          format: 'Each row is composed of 2 columns: address and amount',
          titleLine: 'Title line is not required. If added, title line MUST be "address, amount"',
          big: 'May wait for a while for big CSV files',
          compat: 'This sender batches transactions into a single transaction, which implementation may be not compatible with some wallets / exchange. The problem could be solved by using direct sending mode',
          checkExample: 'Check example',
        },
        directSendingMode: {
          password: "Password here",
          warning: "WARNING for direct sending mode",
          atomic: "In direct sending mode, transactions will be done one after another, which means there is no atomicity for the batch sending",
          balance: "Making sure you have enough CFX for gas: we will check your balance is greater than the sum of transfer values, but gas cost will be ignore.",
          secret: "Secret key file is required, otherwise you have to approve every transaction by using Conflux Portal",
          error: "In direct sending mode, every 2000 transactions will be batched and sent. If any error occurs for current batch, the rest of the transactions will not be sent"
        }
      }
    },
  },
  // ja: {
  //   message: {
  //     hello: "こんにちは、世界",
  //   },
  // },
  "zh-CN": {
      message:{
        title: "Conflux 批量转账工具",
        selectToken: '代币选择',
        selectText: "下拉选择或键入搜索",
        connect: '连接钱包',
        onRequest: "请求中...",
        currentAccountAddress: '当前账户地址',
        toConfluxScan: '在 ConfluxScan 上查看',
        latestOperationStatus: '最新操作状态',
        ok: '确认',
        cancel: '取消',
        token: '代币',
        address: '地址',
        tokenBalance: '代币余额',
        decimals: '小数位',
        operationType: '操作类型',
        tokenAmount: '代币数',
        transactionHash: '交易哈希',
        operator: '操作者',
        sender: '发送者',
        tokenContractAddress: '代币合约地址',
        currentTransactionStatus: '当前交易状态',
        transferSum: '转账代币总数',
        transferCount: '转账条数',
        historyTransactions: '历史交易',
        command: {
          clearHistory: '清空历史交易',
          resetCsv: '重置CSV文件',
          send: '批量转账',
          sendInDirectSendingMode: '以直接转账模式进行批量转账',
          uploadSecretKey: '上传私钥文件'
        },
        error: {
          networkError: '网络错误',
          error: "错误",
          transactionError: '交易执行错误',
          installationError: '未检测到 ConfluxPortal',
        },
        warning: {
          connectionWarning: '请连接钱包',
          tokenWarning: '请选择Token',
          changeNetworkWarning: '请在 ConfluxPortal 中切换至测试网, 并手动刷新页面',
          clearHistory: '确定清空所有历史交易吗?',
        },
        tooltip: {
          networkTooltip: '在 ConfluxPortal 中切换网络',
          portal: {
            beg: "使用Conflux测试网水龙头需要安装浏览器插件",
            end: "",
          },
          executed: '交易已执行，但尚未确认',
          historyTransactions: '本页未关闭时已确认的交易会被记录, 这些交易记录仅保存在用户本地',
          csv: {
            drag: '将CSV文件拖到此处，或',
            clickToUpload: '点击上传',
            resolve: '支持的格式：.csv',
            format: '每行为一组数据，第一列为地址，第二列为转账代币数量',
            titleLine: '不需要添加标题行，如果添加，标题行格式只能为 address, amount',
            big: '文件较大时请稍作等待',
            compat: '本工具通过调用智能合约方法进行批量转账，该方式可能与部分钱包/交易所不兼容。直接转账模式下能解决相应问题。',
            checkExample: '查看示例',
          },
          directSendingMode: {
            password: "请输入口令",
            warning: "直接转账模式须知",
            atomic: "警告：直接转账模式下交易将会逐笔进行，该模式无法保证批量转账的原子性",
            balance: "转帐前将检测余额是否足够，但不会考虑gas消费，还请注意",
            secret: "直接转账模式需要您的私钥文件（否则使用Conflux Portal需要逐笔授权）",
            error: "直接转账模式下，每2000笔交易将打包发出。某次打包发送出错后，其后的交易将不会发送"
          }
        },
        
      }
  }
};

const i18n = new VueI18n({
  locale: "zh-CN", // 设置地区
  fallbackLocale: "zh-CN",
  messages, // 设置地区信息
})

export default i18n;

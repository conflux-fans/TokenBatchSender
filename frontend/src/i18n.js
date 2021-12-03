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
      importSecretKey: 'IMPORT SECRET KEY',
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
      transferDetails: 'Transfer Details',
      command: {
        clearHistory: 'CLEAR HISTORY',
        resetCsv: 'RESET CSV',
        send: 'SEND',
        sendInDirectSendingMode: 'SEND',
        uploadSecretKey: 'Select Keystore File',
        resumePendingRequestsInDirectSendingMode: "RESUME SENDING",
        doResume: "Do Resume",
        logout: "logout"
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
        balanceRefreshed: "Balance Refreshed",
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
          compat: 'In current mode, the sender will batch transfers into a single transaction, in which case several wallets / exchange could not detect the transfer. The problem could be solved by using direct sending mode',
          checkExample: 'Check example',
        },
        directSendingMode: {
          modeOnTooltip: "Direct sending mode is on. Page will refresh if mode is changed",
          modeOffTooltip: "Direct sending mode is off. Page will refresh if mode is changed",
          password: "Password here",
          secretKeyPlaceholder: "Secret key here (beginning with 0x)",
          selectKeystore: "Select Keystore File",
          inputSecretKey: "Input Secret Key",
          warning: "direct sending mode",
          atomic: "In direct sending mode, transactions will be done one after another",
          secret: "Secret key is required for direct sending mode, otherwise you have to approve every transaction by using Conflux Portal",
          error: "In direct sending mode, every 500 transactions will be batched and sent. Sending would pause if any error occured, and sending cound resume from the break point"
        },
        doResume: {
          progress: "{last} transactions have been sent, press button to check the latest transaction status and resume sending (if there are unsent transactions)",
          warning: "WARNING for resume",
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
        importSecretKey: '导入私钥',
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
        transferDetails: '转账详情',
        command: {
          clearHistory: '清空历史交易',
          resetCsv: '重置CSV文件',
          send: '批量转账',
          sendInDirectSendingMode: '批量转账',
          uploadSecretKey: '选择私钥文件',
          resumePendingRequestsInDirectSendingMode: "续发",
          doResume: "续发",
          logout: "登出"
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
          balanceRefreshed: "余额已更新",
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
            compat: '当前模式会调用智能合约方法进行批量转账，该方式可能与部分钱包/交易所不兼容。直接转账模式下能解决相应问题',
            checkExample: '查看示例',
          },
          directSendingMode: {
            modeOnTooltip: "直接转账模式已启用。切换模式后，页面会自动刷新",
            modeOffTooltip: "直接转账模式已关闭。切换模式后，页面会自动刷新",
            password: "请输入口令",
            secretKeyPlaceholder: "输入私钥（以0x开头）",
            selectKeystore: "导入 Keystore 文件",
            inputSecretKey: "直接输入私钥",
            warning: "直接转账模式须知",
            atomic: "直接转账模式下交易将会逐笔进行",
            secret: "直接转账模式需要您的私钥（否则使用Conflux Portal需要逐笔授权）",
            error: "直接转账模式下，每 500 笔交易将打包发出。转账因错误中断时，可以使用续发功能从中断的地方继续转账"
          },
          doResume: {
            progress: "您已发出了 {last} 笔交易, 接下来将确认已发送交易的状态并续发之后的交易（如果仍有交易需要续发）",
            warning: "续发模式说明",
            condition: "直接发送模式下产生错误时，希望从断点续发时可以选择使用续发模式",
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

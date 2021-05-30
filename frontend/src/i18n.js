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
          drag: 'Drag CSV here, or',
          clickToUpload: 'click to upload',
          resolve: 'Only CSV format is supported',
          format: 'Each row is composed of 2 columns: address and transfer amount',
          titleLine: 'Title line is not required. If added, title line MUST be "address, amount"',
          big: 'May wait for a while for big CSV files',
          view: 'Check ',
          exampleFile: 'example file'
        },
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
            resolve: '当前只支持CSV格式文件',
            format: '每行为一组数据，第一列为地址，第二列为转账代币数量',
            titleLine: '不需要添加标题行，如果添加，标题行格式只能为 address, amount',
            big: '文件较大时请稍作等待',
            view: '查看',
            exampleFile: '示例文件'
          },
        }
      }
  }
};

const i18n = new VueI18n({
  locale: "zh-CN", // 设置地区
  fallbackLocale: "zh-CN",
  messages, // 设置地区信息
})

export default i18n;

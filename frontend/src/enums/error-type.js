const ErrorType = {
  
  CsvError: "csvError",
  BalanceError: "balanceError",
  TransactionError: "transactionError",
  DirectSendingDialogError: "directSendingDialogError"
  // 1029, main net address
  // -1, hex address
  // other, test net address(1) or other network
  
};

Object.freeze(ErrorType);

export default ErrorType;

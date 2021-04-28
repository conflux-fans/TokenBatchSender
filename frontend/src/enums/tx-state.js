const TxState = {
  NoTask: "NoTask",
  Pending: "Pending",
  Executed: "Executed",
  Confirmed: "Confirmed",
  Error: "Error",
  isFree: function(state) {
    switch (state) {
      case TxState.NoTask:
      case TxState.Confirmed:
      case TxState.Error:
        return true;
      default:
        return false;
    }
  },
  // getColor: function(state) {
  //   switch 
  // }
};

Object.freeze(TxState);

export default TxState;

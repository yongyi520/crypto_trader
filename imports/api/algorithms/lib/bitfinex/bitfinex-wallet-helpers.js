

export const getMarginCurrencyBalanceFromWallets = function(parsedApiWallets, currency){
    return _.find(parsedApiWallets, function(balance){
        return balance.type == 'trading' && balance.currency == currency;
    })
}

export const hasEnoughNextOrderMarginBalance = function(sellCurrencyBalance, nextOrderParams, algorithmRun, algorithmSetting){
    var maxMarginAmount = algorithmSetting.max_margin_amount;
    var requiredSellAmount = parseFloat(nextOrderParams.amount) + algorithmRun.amount_remaining;
    console.log("checking sell margin balance");
    console.log("algorithm Run", algorithmRun);
    console.log("max margin amount", maxMarginAmount);
    console.log("required sell amount", requiredSellAmount);
    return maxMarginAmount >= requiredSellAmount;
}

const getExchangeCurrencyBalanceFromWallets = function(parsedApiWallets, currency){
    return _.find(parsedApiWallets, function(balance){
        return balance.type == 'exchange' && balance.currency == currency;
    })
}

const hasEnoughExchangeBalance = function(currencyBalance, orderParams){
    var requiredAmount = parseFloat(orderParams.amount);
    return currencyBalance.available >= requiredAmount;
}

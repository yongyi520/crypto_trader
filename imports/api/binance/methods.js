import { binanceCurrentBalance, binanceLimitBuyOrder, binanceLimitSellOrder, binanceCancelOrder,
            binanceWebsocketsCandlesticks, binanceWebsocketsUserData} from '/imports/api/binance/rest.js';

import { Algorithms } from '/imports/api/algorithms/algorithms.js';

import { insertAlgorithmRun, editAlgorithmRun } from '/imports/api/algorithm-runs/algorithmRuns-update.js';

// set-orders-algorithm
Meteor.methods({
    'binance.addNewSetOrders': function(doc){
        console.log("doc", doc);
        var type = (doc.entryOrder.side == 'buy') ? 'BLSH' : 'SHBL';
        var algorithm = Algorithms.findOne({type: type, name: 'set_orders'});
        console.log("algorithm", algorithm);
        var algorithm_id = algorithm._id;

        var newAlgorithmRun = {
            algorithm_id,
            exchange: doc.exchange,
            symbol: doc.symbol,
            order_ids: [],
            status: 'CREATED',
            entry_order: {
                side: doc.entryOrder.side,
                price: parseFloat(doc.entryOrder.price),
                quantity: parseFloat(doc.entryOrder.quantity)
            },
            stop_limit_order: {
                side: doc.stopLimitOrder.side,
                limit_price: parseFloat(doc.stopLimitOrder.limitPrice),
                price: parseFloat(doc.stopLimitOrder.price),
                quantity: parseFloat(doc.stopLimitOrder.quantity)
            },
            profit_order: {
                side: doc.profitOrder.side,
                price: parseFloat(doc.profitOrder.price),
                quantity: parseFloat(doc.profitOrder.quantity)
            }
        }
        console.log("new algorithm run", newAlgorithmRun);
        insertAlgorithmRun(newAlgorithmRun);
    },
    'binance.editSetOrder': function(doc){
        // console.log("doc", doc);
        var type = (doc.entryOrder.side == 'buy') ? 'BLSH' : 'SHBL';
        var algorithm = Algorithms.findOne({type: type, name: 'set_orders'});
        // console.log("algorithm", algorithm);
        var algorithm_id = algorithm._id;

        var algorithmRun = {
            algorithm_id,
            exchange: doc.exchange,
            symbol: doc.symbol,
            order_ids: [],
            status: 'CREATED',
            entry_order: {
                side: doc.entryOrder.side,
                price: parseFloat(doc.entryOrder.price),
                quantity: parseFloat(doc.entryOrder.quantity)
            },
            stop_limit_order: {
                side: doc.stopLimitOrder.side,
                limit_price: parseFloat(doc.stopLimitOrder.limitPrice),
                price: parseFloat(doc.stopLimitOrder.price),
                quantity: parseFloat(doc.stopLimitOrder.quantity)
            },
            profit_order: {
                side: doc.profitOrder.side,
                price: parseFloat(doc.profitOrder.price),
                quantity: parseFloat(doc.profitOrder.quantity)
            }
        }

        return editAlgorithmRun(doc._id, algorithmRun);
    }
})

// api
Meteor.methods({
    "binance.balance": function(){
        binanceCurrentBalance( (error, balances) => {
            if(error) {
                console.log("binance current balance error", error)
            } else {
                console.log("binance balances", balances)
            }
        } )
    },
    "binance.limitOrder": function(side, symbol, quantity, price){
        console.log("binance limit order inputs");
        console.log("side: ", side);
        console.log("symbol: ", symbol);
        console.log("quantity: ", quantity);
        console.log("price: ", price);
        if(side == 'buy'){
            binanceLimitBuyOrder(symbol, quantity, price, {type: 'LIMIT'}, (error, response) => {
                if(error){
                    console.log("binance limit buy order error", error);
                } else {
                    console.log("success");
                    console.log("error: ", error);
                    console.log("response: ", response);
                }
            })
        } else if (side == 'sell'){
            binanceLimitSellOrder(symbol, quantity, price, {type: 'LIMIT'}, (error, response) => {
                if(error){
                    console.log("binance limit sell order error", error);
                } else {
                    console.log("success");
                    console.log("error: ", error);
                    console.log("response: ", response);
                }
            })
        }
    },
    "binance.stopLimitOrder": function(side, symbol, quantity, price, limitPrice){
        console.log("binance stop limit order inputs");
        console.log("side: ", side);
        console.log("symbol: ", symbol);
        console.log("quantity: ", quantity);
        console.log("price: ", price);
        console.log("limit price: ", limitPrice);
        if(side == 'buy'){
            binanceLimitBuyOrder(symbol, quantity, price, {stopPrice: limitPrice, type: 'STOP_LOSS_LIMIT'}, (error, response) => {
                if(error){
                    console.log("binance limit buy order error", error);
                } else {
                    console.log("success");
                    console.log("error: ", error);
                    console.log("response: ", response);
                }
            })
        } else if (side == 'sell'){
            binanceLimitSellOrder(symbol, quantity, price, {stopPrice: limitPrice, type: 'STOP_LOSS_LIMIT'}, (error, response) => {
                if(error){
                    console.log("binance limit sell order error", error);
                } else {
                    console.log("success");
                    console.log("error: ", error);
                    console.log("response: ", response);
                }
            })
        }
    },
    "binance.marketOrder": function(side, symbol, quantity){

    },
    "binance.cancelOrder": function(symbol, order_id){
        binanceCancelOrder(symbol, order_id, (error, response, symbol ) => {
            if(error){
                console.log("binance cancel order error", error);
            } else {
                console.log("success");
                console.log("error: ", error);
                console.log("symbol: ", symbol);
                console.log("response: ", response);

            }
        })
    },
    "binance.orderStatus": function(order_id){

    },
    "binance.tradeHistory": function(symbol){

    }
})

// websockets
Meteor.methods({
    "binance.WssCandlesticks": function(symbols, interval){
        // binanceWebsocketsCandlesticks(symbols, interval, (candlesticks) => {
        //
        // })
        binanceWebsocketsCandlesticks(['BNBBTC'], '1m', (candlesticks) => {
            let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
            let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
            console.log(symbol+" "+interval+" candlestick update");
            console.log("open: "+open);
            console.log("high: "+high);
            console.log("low: "+low);
            console.log("close: "+close);
            console.log("volume: "+volume);
            console.log("isFinal: "+isFinal);
        })
    },
    "binance.wssUserData": function(){
        var accountInfoCallback = (userData) => {console.log("outboundAccountInfo Update ~ (Skip)")}
        var executionCallBack = (userData) => {
            let { e:eventType, s:symbol, S:side, o:orderType, q:originalQuantity, p:price, x:executionType, X:orderStatus, i:orderId,
                l:lastFilledQuantity, z:accumulatedQuantity, L:lastFilledPrice, n:commission, N:commissionCurrency, t:tradeId} = userData
            console.log("user data update");
            var data = {
                eventType,
                symbol,
                side,
                orderType,
                originalQuantity,
                price,
                executionType,
                orderStatus,
                orderId,
                lastFilledQuantity,
                lastFilledPrice,
                accumulatedQuantity,
                commission,
                commissionCurrency,
                tradeId
            }

            console.log("execution report update");
            console.log(data);
            // console.log(userData);

        };
        binanceWebsocketsUserData( accountInfoCallback, executionCallBack );
    }
})
import { getWalletBalances, getMyActiveOrders, getOrderBook, getAllSymbols,
            getMyOrderStatus, getMyActivePositions,
            newOrder, replaceOrder, cancelOrder} from '/imports/api/bitfinex/rest.js';

import { getWebsocketClient, openSocket, restartWebsocketClient,
            websocketAddMessageListener, websocketSubscribeToChannel,
            ping, keepAlive, isSocketAlive,
    getWssOnOpenFunction } from '/imports/api/bitfinex/wss.js';

import { resyncMartingaleSHBLBitfinex, initialSellFunction, wssOrderListenerMartingaleSHBLFunction, martingaleRunCreateNextOrders } from '/imports/api/bitfinex/algorithm/martingale/sell-high-buy-low/bitfinex-martingale-SHBL.js';

import { insertErrorLogNoFiber, insertUpdateLogNoFiber, insertErrorLogFiber } from '/imports/api/system-logs/systemLogs-update.js';
import { parseApiWallet, parseApiActivePositions } from '/imports/api/bitfinex/lib/parseResponse/api/apiResponseParser.js';

// algorithm
Meteor.methods({
    "bitfinex.initialSell": function(symbol){
        initialSellFunction(symbol);
    },
    "bitfinex.wssListenerSetup": function(){

        var martingaleOrderListeners = (data) => {

        }
        websocketAddMessageListener( martingaleOrderListeners );
    }
})

// wss
Meteor.methods({
    "bitfinex.newOpenSocket": function(){
        var messageListener = (data) => {
            // console.log( data );
            if(data.length >= 3 && data[1] != "hb"){
                console.log( "type", data[1]);
                console.log( "detail", data[2])
            }
        };

        var pingPongListener = (data) => {
            if(data.event == 'pong')
                keepAlive();
        }

        var onOpenFunction = () => {
            websocketAddMessageListener( messageListener );
            websocketAddMessageListener( pingPongListener );
            websocketAddMessageListener( wssOrderListenerMartingaleSHBLFunction);
            setTimeout( () => resyncMartingaleSHBLBitfinex(), 1000);
        };

        if(getWssOnOpenFunction() == null){
            openSocket( onOpenFunction );
            SyncedCron.add({
                name: 'bitfinex.wssPing',
                schedule: function(parser){
                    return parser.text('every 5 minutes');
                },
                job: function(){
                    ping();
                    setTimeout(() => {
                        if(!isSocketAlive()){
                            console.log("bitfinex wss connection dead, restart websocket");
                            insertErrorLogFiber("server", "bitfinex", "server", "bitfinex connection dead, restarting server in 30 seconds");
                            restartWebsocketClient();
                        } else
                            console.log("bitfinex wss connection ping/pong successful")
                    }, 5000)
                }
            })
            SyncedCron.start();
        } else {
            console.log("socket already open")
            restartWebsocketClient();
        }
    },
    "bitfinex.openSocket": function(){
        var messageListener = (data) => {
            // console.log( data );
            if(data.length >= 3 && data[1] != "hb"){
                console.log( "type", data[1]);
                console.log( "detail", data[2])
            }
        };

        var pingPongListener = (data) => {
            if(data.event == 'pong')
                keepAlive();
        }

        var onOpenFunction = () => {
            websocketAddMessageListener( messageListener );
            websocketAddMessageListener( pingPongListener );
            websocketAddMessageListener( wssOrderListenerMartingaleSHBLFunction);
            setTimeout( () => resyncMartingaleSHBLBitfinex(), 1000);
        };

        if(getWssOnOpenFunction() == null){
            openSocket( onOpenFunction );
            SyncedCron.add({
                name: 'bitfinex.wssPing',
                schedule: function(parser){
                    return parser.text('every 5 minutes');
                },
                job: function(){
                    ping();
                    setTimeout(() => {
                        if(!isSocketAlive()){
                            console.log("bitfinex wss connection dead, restart websocket");
                            insertErrorLogFiber("server", "bitfinex", "server", "bitfinex connection dead, restarting server in 30 seconds");
                            restartWebsocketClient();
                        } else
                            console.log("bitfinex wss connection ping/pong successful")
                    }, 5000)
                }
            })
            SyncedCron.start();
        } else {
            console.log("socket already open")
            restartWebsocketClient();
        }



        // openSocket();
    },
    "bitfinex.ping": function(){
        ping();
    },
    "bitfinex.isSocketAlive": function(){
        console.log("is socket alive? ", isSocketAlive());
    },
    "bitfinex.restartSocket": function(){
        restartWebsocketClient();
    }
})

// martingale fixes
Meteor.methods({
    "bitfinex.martingaleNextOrder": function(){
        var parsedWssDetail = {
            symbol: "omgusd",
            average_price: 8.7828,
            order_id: 4261344819
        }
        martingaleRunCreateNextOrders(parsedWssDetail);
    }
})

// api
Meteor.methods({
    "bitfinex.getMyActivePositions": function(){
        getMyActivePositions().then( parseApiActivePositions ).catch( console.log );
    },
    "bitfinex.getOrderBook": function(){
      console.log("getting order book");
      // bid is buying, ask is selling
      // get bid [0] price and put 0.01 price higher than that
      var symbol = 'ethusd';
      var params = {limit_bids: 10, limit_asks: 10};
      getOrderBook(symbol, params).then( console.log )
          .catch( console.log )
    },
    "bitfinex.getAllSymbols": function(){
        console.log("getting all bitfinex symbols");
        getAllSymbols().then( console.log )
            .catch( console.log )
    },
    "bitfinex.getWalletBalances": function() {
        console.log("getting bitfinex wallet balance");
        getWalletBalances().then( (balances) => console.log(parseApiWallet(balances)) )
            .catch( console.log )
    },
    "bitfinex.getMyActiveOrders": function(){
        console.log("getting bitfinex active orders");
        getMyActiveOrders().then( console.log )
            .catch( console.log )
    },
    "bitfinex.getMyOrderStatus": function(){
        var order_id = 4069222077;
        getMyOrderStatus({order_id}).then( console.log ).catch( console.log );
    },
    "bitfinex.newOrder": function(){
        console.log("creating new order");
        var params = {
            symbol: "ethusd",
            amount: "0.35",
            price: "455",
            side: "sell",
            type: "exchange limit",
            exchange: "bitfinex"
        }
        newOrder(params).then( console.log )
            .catch( console.log )
    },
    "bitfinex.replaceOrder": function(){
        console.log("replace order");
        // remember that order_id changes after you replace it!
        var params = {
            order_id: 3678554358,
            symbol: "ethusd",
            amount: "0.35",
            price: "500.01",
            side: "sell",
            type: "exchange limit",
            exchange: "bitfinex"
        };
        replaceOrder(params).then( console.log )
            .catch( console.log )
    },
    "bitfinex.cancelOrder": function(){
        console.log("cancel order");
        var order_id = 3678624519;
        cancelOrder({order_id}).then( console.log )
            .catch( console.log )
    }
})
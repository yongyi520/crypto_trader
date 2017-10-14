import React, { Component } from 'react';

require('/imports/ui/components/debug/BitfinexTesting.sass')

export default class BitfinexTesting extends Component {

    getWalletBalances(){
        Meteor.call("bitfinex.getWalletBalances");
    }

    getAllSymbols(){
        Meteor.call("bitfinex.getAllSymbols");
    }

    getMyActivePositions(){
        Meteor.call("bitfinex.getMyActivePositions");
    }

    getOrderBook(){
        Meteor.call("bitfinex.getOrderBook");
    }

    getActiveOrders(){
        Meteor.call("bitfinex.getMyActiveOrders");
    }

    getMyOrderStatus(){
        Meteor.call("bitfinex.getMyOrderStatus");
    }

    newOrder(){
        Meteor.call("bitfinex.newOrder");
    }

    replaceOrder(){
        Meteor.call("bitfinex.replaceOrder");
    }

    cancelOrder(){
        Meteor.call("bitfinex.cancelOrder");
    }

    restartSocket(){
        Meteor.call('bitfinex.restartSocket')
    }

    openSocket(){
        Meteor.call("bitfinex.openSocket");
    }

    ping(){
        Meteor.call("bitfinex.ping");
    }

    isSocketAlive(){
        Meteor.call("bitfinex.isSocketAlive");
    }

    initialSellETHUSD(){
        Meteor.call("bitfinex.initialSell", 'ethusd');
    }

    initialSellOMGUSD(){
        Meteor.call("bitfinex.initialSell", 'omgusd');
    }

    initialSellOMGBTC(){
        Meteor.call("bitfinex.initialSell", 'omgbtc');
    }

    initialSellNEOUSD(){
        Meteor.call("bitfinex.initialSell", 'neousd');
    }

    initialSellNEOBTC(){
        Meteor.call("bitfinex.initialSell", 'neobtc');
    }

    wssListenerSetup(){
        Meteor.call("bitfinex.wssListenerSetup");
    }

    allOrders(){
        Meteor.call("allOrders");
    }

    resetOrders(){
        Meteor.call("resetOrders");
    }

    allAlgorithms(){
        Meteor.call("allAlgorithms");
    }

    resetAlgorithms(){
        Meteor.call("resetAlgorithms");
    }

    addAlgorithm(){
        Meteor.call("addAlgorithm");
    }

    allAlgorithmSettings(){
        Meteor.call("allAlgorithmSettings")
    }

    resetAlgorithmSettings(){
        Meteor.call("resetAlgorithmSettings")
    }

    allAlgorithmRuns(){
        Meteor.call("allAlgorithmRuns")
    }

    removeETHAlgorithmRuns(){

    }

    removeOMGAlgorithmRuns(){
        Meteor.call("removeAlgorithmRuns", "bitfinex", "omgusd");
    }

    resetAlgorithmRuns(){
        Meteor.call("resetAlgorithmRuns")
    }



    render() {
        return (
            <div className="content-wrapper">
                <div id="bitfinex-testing" className="content">
                    <div className="title">
                        <h2>Bitfinex Testing</h2>
                    </div>
                    <div className="main-content">
                        <div className="panel">
                            <h4>API General Calls</h4>
                            <button onClick={this.getWalletBalances.bind(this)}>Wallet Balances</button>
                            <button onClick={this.getAllSymbols.bind(this)}>All Symbols</button>
                        </div>
                        <div className="panel">
                            <h4>API Order Calls</h4>
                            <button onClick={this.getMyActivePositions.bind(this)}>Active Positions</button>
                            <button onClick={this.getOrderBook.bind(this)}>Order Book</button>
                            <button onClick={this.getActiveOrders.bind(this)}>Active Orders</button>
                            <button onClick={this.getMyOrderStatus.bind(this)}>Order Status</button>
                            <button onClick={this.newOrder.bind(this)}>New Order</button>
                            <button onClick={this.replaceOrder.bind(this)}>Replace Order</button>
                            <button onClick={this.cancelOrder.bind(this)}>Cancel Order</button>
                        </div>
                        <div className="panel">
                            <h4>WSS Calls</h4>
                            <button onClick={this.restartSocket.bind(this)}>Restart Socket</button>
                            <button onClick={this.openSocket.bind(this)}>Open Socket</button>
                            <button onClick={this.ping.bind(this)}>Ping</button>
                            <button onClick={this.isSocketAlive.bind(this)}>Is Socket Alive</button>
                        </div>
                        <div className="panel">
                            <h4>Martingale Algorithm Test</h4>
                            <button onClick={this.initialSellETHUSD.bind(this)}>Initial Sell ETHUSD</button>
                            <button onClick={this.initialSellOMGUSD.bind(this)}>Initial Sell OMGUSD</button>
                            <button onClick={this.initialSellOMGBTC.bind(this)}>Initial Sell OMGBTC</button>
                            <button onClick={this.initialSellNEOUSD.bind(this)}>Initial Sell NEOUSD</button>
                            <button onClick={this.initialSellNEOBTC.bind(this)}>Initial Sell NEOBTC</button>
                            <button onClick={this.wssListenerSetup.bind(this)}>Wss Listener Setup</button>
                        </div>
                        <div className="panel">
                            <h4>Orders Collection</h4>
                            <button onClick={this.allOrders.bind(this)}>All Orders</button>
                            <button onClick={this.resetOrders.bind(this)}>Reset Orders</button>
                        </div>
                        <div className="panel">
                            <h4>Algorithm Collection</h4>
                            <button onClick={this.allAlgorithms.bind(this)}>All Algorithms</button>
                            <button onClick={this.resetAlgorithms.bind(this)}>Reset Algorithms</button>
                            <button onClick={this.addAlgorithm.bind(this)}>Add Algorithm</button>
                        </div>
                        <div className="panel">
                            <h4>Algorithm Settings Collection</h4>
                            <button onClick={this.allAlgorithmSettings.bind(this)}>All Algorithms Settings</button>
                            <button onClick={this.resetAlgorithmSettings.bind(this)}>Reset Algorithms Settings</button>
                        </div>
                        <div className="panel">
                            <h4>Algorithm Runs Collection</h4>
                            <button onClick={this.allAlgorithmRuns.bind(this)}>All Algorithms Runs</button>
                            <button onClick={this.removeETHAlgorithmRuns.bind(this)}>Remove ETH Algorithm Runs</button>
                            <button onClick={this.removeOMGAlgorithmRuns.bind(this)}>Remove OMG Algorithm Runs</button>
                            <button onClick={this.resetAlgorithmRuns.bind(this)}>Reset Algorithms Runs</button>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
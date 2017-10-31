import React, { Component } from 'react';

require('/imports/ui/components/debug/BitfinexTesting.sass')

export default class BitfinexTesting extends Component {

    martingaleNextOrders(){
        var order_id = parseInt(this.refs.orderId.value);
        Meteor.call("bitfinex.martingaleNextOrders", order_id);
    }

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
        Meteor.call("bitfinex.isSocketAlive", (error, alive) => {
            if(alive){
                alert("the socket is live")
            } else {
                alert("the socket is dead")
            }
        });
    }

    martingaleShblETHUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'ethusd');
    }

    martingaleShblETHBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'ethbtc');
    }

    martingaleShblOMGUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'omgusd');
    }

    martingaleShblOMGBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'omgbtc');
    }

    martingaleShblNEOUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'neousd');
    }

    martingaleShblNEOBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'neobtc');
    }

    martingaleShblXRPUSD(){
        Meteor.call("bitfinex.martingaleSHBL", 'xrpusd');
    }

    martingaleShblXRPBTC(){
        Meteor.call("bitfinex.martingaleSHBL", 'xrpbtc');
    }

    martingaleBlshETHUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'ethusd');
    }

    martingaleBlshETHBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'ethbtc');
    }

    martingaleBlshOMGUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'omgusd');
    }

    martingaleBlshOMGBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'omgbtc');
    }

    martingaleBlshNEOUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'neousd');
    }

    martingaleBlshNEOBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'neobtc');
    }

    martingaleBlshXRPUSD(){
        Meteor.call("bitfinex.martingaleBLSH", 'xrpusd');
    }

    martingaleBlshXRPBTC(){
        Meteor.call("bitfinex.martingaleBLSH", 'xrpbtc');
    }

    dailyShblBTCUSD(){
        Meteor.call("bitfinex.dailySHBL", 'btcusd');
    }

    dailyShblOMGUSD(){
        Meteor.call("bitfinex.dailySHBL", 'omgusd');
    }

    dailyShblNEOUSD(){
        Meteor.call("bitfinex.dailySHBL", 'neousd');
    }

    dailyBlshBTCUSD(){
        Meteor.call("bitfinex.dailyBLSH", 'btcusd');
    }

    dailyBlshOMGUSD(){
        Meteor.call("bitfinex.dailyBLSH", 'omgusd');
    }

    dailyBlshNEOUSD(){
        Meteor.call("bitfinex.dailyBLSH", 'neousd');
    }

    wssListenerSetup(){
        Meteor.call("bitfinex.wssListenerSetup");
    }

    allOrders(){
        Meteor.call("allOrders");
    }

    removeNonActiveAlgorithmRunOrders(){
        Meteor.call("removeNonActiveAlgorithmRunOrders");
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

    removeNonActiveAlgorithmRun(){
        Meteor.call("removeNonActiveAlgorithmRuns");
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
                            <h4>Troubleshoot</h4>
                            <input ref="orderId" type="number"/>
                            <button onClick={this.martingaleNextOrders.bind(this)}>Martingale Next Orders</button>
                        </div>
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
                            <h5>SHBL</h5>
                            <button onClick={this.martingaleShblETHUSD.bind(this)}>ETHUSD</button>
                            <button onClick={this.martingaleShblETHBTC.bind(this)}>ETHBTC</button>
                            <button onClick={this.martingaleShblOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.martingaleShblOMGBTC.bind(this)}>OMGBTC</button>
                            <button onClick={this.martingaleShblNEOUSD.bind(this)}>NEOUSD</button>
                            <button onClick={this.martingaleShblNEOBTC.bind(this)}>NEOBTC</button>
                            <button onClick={this.martingaleShblXRPUSD.bind(this)}>XRPUSD</button>
                            <button onClick={this.martingaleShblXRPBTC.bind(this)}>XRPBTC</button>
                            <h5>BLSH</h5>
                            <button onClick={this.martingaleBlshETHUSD.bind(this)}>ETHUSD</button>
                            <button onClick={this.martingaleBlshETHBTC.bind(this)}>ETHBTC</button>
                            <button onClick={this.martingaleBlshOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.martingaleBlshOMGBTC.bind(this)}>OMGBTC</button>
                            <button onClick={this.martingaleBlshNEOUSD.bind(this)}>NEOUSD</button>
                            <button onClick={this.martingaleBlshNEOBTC.bind(this)}>NEOBTC</button>
                            <button onClick={this.martingaleBlshXRPUSD.bind(this)}>XRPUSD</button>
                            <button onClick={this.martingaleBlshXRPBTC.bind(this)}>XRPBTC</button>
                        </div>
                        <div className="panel">
                            <h4>Daily Algorithm Test</h4>
                            <h5>SHBL</h5>
                            <button onClick={this.dailyShblBTCUSD.bind(this)}>BTCUSD</button>
                            <button onClick={this.dailyShblOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.dailyShblNEOUSD.bind(this)}>NEOUSD</button>
                            <h5>BLSH</h5>
                            <button onClick={this.dailyBlshBTCUSD.bind(this)}>BTCUSD</button>
                            <button onClick={this.dailyBlshOMGUSD.bind(this)}>OMGUSD</button>
                            <button onClick={this.dailyBlshNEOUSD.bind(this)}>NEOUSD</button>
                        </div>
                        <div className="panel">
                            <h4>Orders Collection</h4>
                            <button onClick={this.allOrders.bind(this)}>All Orders</button>
                            <button onClick={this.removeNonActiveAlgorithmRunOrders.bind(this)}>Remove Non Active Algorithm Run Orders</button>
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
                            <button onClick={this.removeNonActiveAlgorithmRun.bind(this)}>Remove Non-Active Algorithm Runs</button>
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
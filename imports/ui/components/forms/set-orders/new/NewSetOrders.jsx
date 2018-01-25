import React, {Component} from 'react';

require('/imports/ui/components/forms/set-orders/SetOrders.sass')

export class NewSetOrders extends Component {

    handleSubmit(e){

        console.log("handle submit props", this.props);
        e.preventDefault();

        var newSetOrders = {
            exchange: 'binance',
            symbol: this.props.symbol,
            entryOrder: {
                side: this.refs.entryOrderSide.value,
                price: this.refs.entryOrderPrice.value,
                quantity: this.refs.entryOrderQuantity.value
            },
            stopLimitOrder: {
                side: this.refs.stopLimitOrderSide.value,
                limitPrice: this.refs.stopLimitOrderLimitPrice.value,
                price: this.refs.stopLimitOrderPrice.value,
                quantity: this.refs.stopLimitOrderQuantity.value
            },
            profitOrder: {
                side: this.refs.profitOrderSide.value,
                price: this.refs.profitOrderPrice.value,
                quantity: this.refs.profitOrderQuantity.value
            }
        };
        console.log("new set orders", newSetOrders);
        Meteor.call('binance.addNewSetOrders', newSetOrders)
    }

    areInputsEmpty(){

    }

    entryOrderSideInputHandler(){
        if(this.refs.entryOrderSide.value == 'buy'){
            this.refs.stopLimitOrderSide.value = 'sell';
            this.refs.profitOrderSide.value = 'sell'
        } else if (this.refs.entryOrderSide.value == 'sell'){
            this.refs.stopLimitOrderSide.value = 'buy';
            this.refs.profitOrderSide.value = 'buy'
        }
    }

    stopLimitOrderSideInputHanlder(){
        if(this.refs.stopLimitOrderSide.value == 'buy'){
            this.refs.entryOrderSide.value = 'sell';
            this.refs.profitOrderSide.value = 'buy'
        } else if (this.refs.stopLimitOrderSide.value == 'sell'){
            this.refs.entryOrderSide.value = 'buy';
            this.refs.profitOrderSide.value = 'sell'
        }
    }

    profitOrderSideInputHandler(){
        if(this.refs.profitOrderSide.value == 'buy'){
            this.refs.entryOrderSide.value = 'sell'
            this.refs.stopLimitOrderSide.value = 'buy';
        } else if (this.refs.profitOrderSide.value == 'sell'){
            this.refs.entryOrderSide.value = 'buy'
            this.refs.stopLimitOrderSide.value = 'sell';
        }
    }

    render(){
        console.log("set order props", this.props);
        return (
            <div className="inputs-set-orders" >
                <div className="title">
                    Inputs
                </div>
                <form className="inputs" onSubmit={this.handleSubmit.bind(this)}>
                    <div className="order">
                        <div className="title">
                            Entry Order
                        </div>
                        <div className="order-inputs">
                            <div className="form-group">
                                <label>Side</label>
                                <select ref="entryOrderSide" defaultValue='buy' onChange={this.entryOrderSideInputHandler.bind(this)}>
                                    <option value="buy">buy</option>
                                    <option value="sell">sell</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input ref="entryOrderPrice" placeholder="Price"/>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input ref="entryOrderQuantity" placeholder="Quantity"/>
                            </div>
                        </div>
                    </div>
                    <div className="order">
                        <div className="title">
                            Stop Limit Order
                        </div>
                        <div className="order-inputs">
                            <div className="form-group">
                                <label>Side</label>
                                <select ref="stopLimitOrderSide" defaultValue='sell' onChange={this.stopLimitOrderSideInputHanlder.bind(this)}>
                                    <option value="buy">buy</option>
                                    <option value="sell">sell</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Limit Price</label>
                                <input ref="stopLimitOrderLimitPrice" placeholder="Limit Price"/>
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input ref="stopLimitOrderPrice" placeholder="Price"/>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input ref="stopLimitOrderQuantity" placeholder="Quantity"/>
                            </div>

                        </div>
                    </div>
                    <div className="order">
                        <div className="title">
                            Profit Order
                        </div>
                        <div className="order-inputs">
                            <div className="form-group">
                                <label>Side</label>
                                <select ref="profitOrderSide" defaultValue='sell' onChange={this.profitOrderSideInputHandler.bind(this)}>
                                    <option value="buy">buy</option>
                                    <option value="sell">sell</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input ref="profitOrderPrice" placeholder="Price"/>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input ref="profitOrderQuantity" placeholder="Quantity"/>
                            </div>
                        </div>
                    </div>
                    <div className="button">
                        <input type="submit" value="New Set Orders"/>
                    </div>
                </form>

            </div>
        )
    }
}


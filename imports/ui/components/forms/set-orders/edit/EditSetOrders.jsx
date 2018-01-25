import React, {Component} from 'react';

require('/imports/ui/components/forms/set-orders/SetOrders.sass')

export class EditSetOrders extends Component {

    handleSubmit(e){

        console.log("handle submit props", this.props);
        e.preventDefault();

        var editSetOrder = {
            _id: this.props.algorithmRun._id,
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
        console.log("edit set orders", editSetOrder);
        Meteor.call('binance.editSetOrder', editSetOrder, (error, result) => {
            if(error){
                console.log("edit set order error occured", error);
            } else if (result){
                console.log("update set order success", result);
                this.props.updateAlgorithmRunSelect();
            }
        })
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
                                <select ref="entryOrderSide" defaultValue={this.props.algorithmRun.entry_order.side} onChange={this.entryOrderSideInputHandler.bind(this)}>
                                    <option value="buy">buy</option>
                                    <option value="sell">sell</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input ref="entryOrderPrice" placeholder="Price" defaultValue={this.props.algorithmRun.entry_order.price}/>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input ref="entryOrderQuantity" placeholder="Quantity" defaultValue={this.props.algorithmRun.entry_order.quantity}/>
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
                                <select ref="stopLimitOrderSide" defaultValue={this.props.algorithmRun.stop_limit_order.side} onChange={this.stopLimitOrderSideInputHanlder.bind(this)}>
                                    <option value="buy">buy</option>
                                    <option value="sell">sell</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Limit Price</label>
                                <input ref="stopLimitOrderLimitPrice" placeholder="Limit Price" defaultValue={this.props.algorithmRun.stop_limit_order.limit_price}/>
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input ref="stopLimitOrderPrice" placeholder="Price" defaultValue={this.props.algorithmRun.stop_limit_order.price}/>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input ref="stopLimitOrderQuantity" placeholder="Quantity" defaultValue={this.props.algorithmRun.stop_limit_order.quantity}/>
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
                                <select ref="profitOrderSide" defaultValue={this.props.algorithmRun.profit_order.side} onChange={this.profitOrderSideInputHandler.bind(this)}>
                                    <option value="buy">buy</option>
                                    <option value="sell">sell</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input ref="profitOrderPrice" placeholder="Price" defaultValue={this.props.algorithmRun.profit_order.price}/>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input ref="profitOrderQuantity" placeholder="Quantity" defaultValue={this.props.algorithmRun.profit_order.quantity}/>
                            </div>
                        </div>
                    </div>
                    <div className="button">
                        <input type="submit" value="Save Set Orders"/>
                    </div>
                </form>

            </div>
        )
    }
}



// wss parser
import { parseWssOrder, convertApiParsedOrderToWssParsedOrder } from '/imports/api/bitfinex/lib/parseResponse/wss/wssResponseParser';

// collection update
import { updateCancelOrder, updateExecutedOrder, updateExecutedOrderNoFiber, insertOrder } from '/imports/api/orders/orders-update.js';

// wss listeners
import { martingaleNextStep } from '/imports/api/bitfinex/algorithm/martingale/martingale-bitfinex.js';

export const wssOrderListenerMartingaleSHBLFunction = function(data){
    if(data.length >= 3){
        if(data[1] == 'oc'){
            var parsedWssOrderDetail = parseWssOrder(data[2]);
            console.log("data detail", parsedWssOrderDetail);

            if (parsedWssOrderDetail.status.includes('EXECUTED') || parsedWssOrderDetail.amount == 0){
                console.log("order executed");
                martingaleNextStep(parsedWssOrderDetail);
            } else if(parsedWssOrderDetail.status.includes('CANCELED')){
                console.log("order cancelled");
                // update canceled order
                updateCancelOrder(parsedWssOrderDetail.order_id);
            }
        }
    }
}
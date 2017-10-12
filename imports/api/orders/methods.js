import { Orders } from '/imports/api/orders/orders.js';

Meteor.methods({
    "allOrders": function(){
        var allOrders = Orders.find().fetch();
        console.log("all orders", allOrders);
    },
    "resetOrders": function(){
        console.log("resetting orders");
        Orders.remove({});
    }
})
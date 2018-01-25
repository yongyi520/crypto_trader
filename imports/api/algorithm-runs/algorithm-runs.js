export const AlgorithmRuns = new Meteor.Collection("AlgorithmRuns");

AlgorithmRunsSchema = new SimpleSchema({
    algorithm_id: {
        type: String,
    },
    exchange: {
        type: String
    },
    symbol: {
        type: String
    },
    order_ids: {
        type: [Number],
        optional: true
    },
    status: {
        type: String
    },
    amount_total: {
        type: Number,
        decimal: true,
        optional: true
    },
    amount_executed: {
        type: Number,
        decimal: true,
        optional: true
    },
    amount_remaining: {
        type: Number,
        decimal: true,
        optional: true
    },
    average_executed_price: {
        type: Number,
        decimal: true,
        optional: true
    },
    average_remaining_price: {
        type: Number,
        decimal: true,
        optional: true
    },
    average_total_price: {
        type: Number,
        decimal: true,
        optional: true
    },
    entry_order: {
        type: Object,
        optional: true
    },
    "entry_order.side": {
        type: String
    },
    "entry_order.price": {
        type: Number,
        decimal: true
    },
    "entry_order.quantity": {
        type: Number,
        decimal: true
    },
    profit_order: {
        type: Object,
        optional: true
    },
    "profit_order.side": {
        type: String
    },
    "profit_order.price": {
        type: Number,
        decimal: true
    },
    "profit_order.quantity": {
        type: Number,
        decimal: true
    },
    stop_limit_order: {
        type: Object,
        optional: true
    },
    "stop_limit_order.side": {
        type: String
    },
    "stop_limit_order.limit_price": {
        type: Number,
        decimal: true
    },
    "stop_limit_order.price": {
        type: Number,
        decimal: true
    },
    "stop_limit_order.quantity": {
        type: Number,
        decimal: true
    },
})

AlgorithmRuns.attachSchema(AlgorithmRunsSchema);
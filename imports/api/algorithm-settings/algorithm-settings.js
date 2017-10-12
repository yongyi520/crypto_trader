export const AlgorithmSettings = new Meteor.Collection("AlgorithmSettings");

AlgorithmSettingsSchema = new SimpleSchema({
    algorithm_id: {
        type: String
    },
    exchange: {
        type: String
    },
    symbol: {
        type: String
    },
    is_active: {
        type: Boolean
    },
    step_size: {
        type: Number,
        decimal: true,
        optional: true
    },
    buy_back: {
        type: Number,
        decimal: true,
        optional: true
    },
    start_amount: {
        type: Number,
        decimal: true,
        optional: true
    }
})

AlgorithmSettings.attachSchema(AlgorithmSettingsSchema)
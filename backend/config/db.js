const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected ✅");
        console.log("MongoDB Host:", mongoose.connection.host);
        console.log("MongoDB Database:", mongoose.connection.name);
    } catch (error) {
        console.log("MongoDB Error ❌", error);
        throw error;
    }
};

module.exports = connectDB;
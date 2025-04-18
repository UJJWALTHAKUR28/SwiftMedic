const mongoose = require('mongoose');
async function connectToDb() {
    try {
        await mongoose.connect(process.env.DB_CONNECT); 
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
}
module.exports = connectToDb;

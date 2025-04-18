const userModel = require('../models/user.model');
module.exports.createUser = async ({firstname,lastname,email,password}) => {

    if(!firstname || !email || !password) {
        throw new Error('All fields are required');
    }
    const user = userModel({
        fullname: { firstname, lastname },
        email,
        password
    });
    await user.save();
    return user;
}
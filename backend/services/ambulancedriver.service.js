const AmbulancedriverModel = require('../models/ambulancedriver.model');

module.exports.createAmbulancedriver = async (data) => {
    const { firstname, lastname, email, password, phonenumber, vehicle } = data;

    if (!firstname || !email || !password || !vehicle || !vehicle.plate) {
        throw new Error('All fields are required');
    }

    const ambulancedriver = new AmbulancedriverModel({
        fullname: { firstname, lastname },
        email,
        password,
        phonenumber,
        vehicle
    });

    await ambulancedriver.save();
    return ambulancedriver;
};

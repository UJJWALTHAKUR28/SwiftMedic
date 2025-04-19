const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const AmbulancedriverSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: 3
        },
        lastname: {
            type: String,
        }
    },
    phonenumber: {
        type: Number,
        required: true,
        unique: true,
        minlength: 10
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+@.+\..+/,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    socketId: String,
    status: {
        type: String,
        enum: ['available', 'busy', 'inactive'],
        default: 'inactive'
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    vehicle: {
        plate: {
            type: String,
            required: true,
            unique: true,
            minlength: 5
        },
        type: {
            type: String,
            required: true,
            enum: [
                'Basic Life Support (BLS)', 'Advanced Life Support (ALS)', 'Mobile Intensive Care Unit (MICU)',
                'Air Ambulance', 'Patient Transport Ambulances', 'Neonatal Ambulance', 'Pediatric Ambulance',
                'Critical Care Transport', 'Non-Emergency Medical Transport (NEMT)', 'Event Medical Services',
                'Rescue Ambulance', 'Fire Rescue Ambulance', 'Community Paramedicine Ambulance'
            ]
        },
        color: {
            type: String,
            required: true,
            minlength: 3
        },
        model: {
            type: String,
            required: true,
            minlength: 3
        },
        year: {
            type: Number,
            required: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1
        }
    }
});

AmbulancedriverSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

AmbulancedriverSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

AmbulancedriverSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

module.exports = mongoose.model('ambulancedriver', AmbulancedriverSchema);

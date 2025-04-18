module.exports.getAddressCoordinate = async(address)=>{
try {
    const apiKey = process.env.YOUR_GOOGLE_MAPS_API_KEY; // Replace with your actual API key
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng
        };
    } else {
        throw new Error('Unable to find coordinates for the given address');
    }
} catch (error) {
    throw new Error(`Error getting coordinates: ${error.message}`);
}
}
module.exports.getDistanceTime = async (origin, destination) => {
    if(!origin||destination){
        throw new Error('Origin and  destination are required')
    }
    try {
        const apiKey = process.env.YOUR_GOOGLE_MAPS_API_KEY; // Replace with your actual API key
        const encodedOrigin = encodeURIComponent(origin);
        const encodedDestination = encodeURIComponent(destination);
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.rows.length > 0 && data.rows[0].elements.length > 0) {
            const element = data.rows[0].elements[0];
            if (element.status === 'OK') {
                return {
                    distance: element.distance.text,
                    duration: element.duration.text
                };
            } else {
                throw new Error('Unable to calculate distance and time for the given locations');
            }
        } else {
            throw new Error('Invalid response from the Distance Matrix API');
        }
    } catch (error) {
        throw new Error(`Error getting distance and time: ${error.message}`);
    }
};

module.exports.getAutoCompletesuggestions=async(input)=> {
    if(!input){
        throw new Error('query is required');
    }

    try {
        const apiKey = process.env.YOUR_GOOGLE_MAPS_API_KEY; // Replace with your actual API key
        const encodedInput = encodeURIComponent(input);
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedInput}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.predictions.length > 0) {
            return data.predictions.map(prediction => ({
                description: prediction.description,
                placeId: prediction.place_id
            }));
        } else {
            throw new Error('No autocomplete suggestions found for the given input');
        }
    } catch (error) {
        throw new Error(`Error getting autocomplete suggestions: ${error.message}`);
    }
}
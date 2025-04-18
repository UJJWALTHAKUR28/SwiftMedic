"use client"
import React from 'react'
import 'remixicon/fonts/remixicon.css'

const LocationSearchPanel = ({ 
  suggestions, 
  setpanel, 
  setvehiclepanel, 
  onLocationSelect, 
  isPickup, 
  pickup, 
  dropoff,
  showDefaultLocations 
}) => {
    // Default pickup locations
    const defaultPickupLocations = [
        {
            description: "Sector 17, Chandigarh",
            placeId: "pickup_1"
        },
        {
            description: "Sector 22 Market, Chandigarh",
            placeId: "pickup_2"
        },
        {
            description: "Phase 7, Mohali",
            placeId: "pickup_3"
        }
    ];

    // Default hospital locations
    const defaultHospitalLocations = [
        {
            description: "Max Hospital, Sector 19, Chandigarh",
            placeId: "hosp_1"
        },
        {
            description: "PGIMER Hospital, Sector 12, Chandigarh",
            placeId: "hosp_2"
        },
        {
            description: "Fortis Hospital, Mohali, Punjab",
            placeId: "hosp_3"
        }
    ];

    // Use API suggestions if available, otherwise show default locations
    const displayLocations = suggestions.length > 0 
        ? suggestions 
        : (isPickup ? defaultPickupLocations : defaultHospitalLocations);

    const handleLocationClick = (location) => {
        onLocationSelect(location.description);
        // Panel stays open - controlled by parent component
    };

    return (
        <div className="p-4">
            {displayLocations.map((location, idx) => (
                <div 
                    key={idx} 
                    onClick={() => handleLocationClick(location)}
                    className='flex items-center gap-4 my-2 justify-start border-2 p-3 rounded-xl border-gray-100 active:border-black cursor-pointer hover:bg-gray-50'
                >
                    <h2 className='bg-[#eee] flex items-center justify-center h-10 w-12 rounded-full'>
                        <i className={isPickup ? "ri-map-pin-line" : "ri-hospital-fill"}></i>
                    </h2>
                    <h4 className='font-medium'>{location.description}</h4>
                </div>
            ))}
        </div>
    );
};

export default LocationSearchPanel;
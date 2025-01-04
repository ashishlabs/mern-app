"use client";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HomeLayout from "@/components/home/Home";

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapComponent: React.FC = () => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [altitude, setAltitude] = useState<number | null>(null);
    const [speed, setSpeed] = useState<number | null>(null);
    const [heading, setHeading] = useState<number | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                setPosition([position.coords.latitude, position.coords.longitude]);
                setAccuracy(position.coords.accuracy);
                setAltitude(position.coords.altitude);
                setSpeed(position.coords.speed);
                setHeading(position.coords.heading);
            },
            (error) => {
                console.error("Error getting location:", error);
            }
        );
    }, []);

    return (
        <HomeLayout>
        <div className="h-screen">
            {position ? (
                <>
                    <MapContainer center={position} zoom={15} className="h-full">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={position}>
                            <Popup>
                                You are here
                                <br />
                                {accuracy && <span>Accuracy: {accuracy} meters</span>}
                                {altitude && <br />}
                                {altitude && <span>Altitude: {altitude} meters</span>}
                                {speed && <br />}
                                {speed && <span>Speed: {speed} m/s</span>}
                                {heading && <br />}
                                {heading && <span>Heading: {heading} degrees</span>}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </>
            ) : (
                <div>Loading...</div>
            )}
        </div>
        </HomeLayout>
    );
};

export default MapComponent;
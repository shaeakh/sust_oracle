import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface MaaaapProps {
  position: LatLngExpression[];
}

// Icon URLs
const iconUrls = [
  "https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/hack_prep/1.png",
  "https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/hack_prep/2.png",
  "https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/hack_prep/6.png",
  "https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/hack_prep/4.png",
  "https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/hack_prep/3.png",
  "https://raw.githubusercontent.com/shaeakh/code-share/refs/heads/main/hack_prep/3.png",
];

// Function to create custom icons
const createIcon = (iconUrl: string) =>
  L.icon({
    iconUrl,
    iconSize: [30, 30], // size of the icon
    shadowSize: [0, 0], // size of the shadow
    iconAnchor: [15, 30], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // point from which the popup should open relative to the iconAnchor
  });

export default function Maaaap({ position }: MaaaapProps) {
  const center: LatLngExpression =
    position.length > 0 ? position[0] : [51.505, -0.09];

  return (
    <div>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position.map((pos, index) => {
          const icon = createIcon(iconUrls[index % 6]); // Select icon based on index % 6
          return (
            <Marker key={index} position={pos} icon={icon}>
              <Popup>Custom Location {index + 1}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

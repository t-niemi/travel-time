import { useState, useEffect } from "react";
import "./leaflet.css";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "./App.css";
import apiClient from "./utils/apiClient";
import { turbo_r } from "./utils/js-colormaps";
import type { Control, LeafletEvent, PathOptions } from "leaflet";
import Canvas from "./Canvas";
import "leaflet-geosearch/assets/css/leaflet.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

interface GridId {
  id: number;
  dist?: number;
}

interface GridItem extends GridId {
  st_asgeojson: GeoJSON.GeoJsonObject;
}

interface TimeItem {
  from_id: number;
  pt_r_avg: number;
}

interface GeoEvent extends LeafletEvent {
  location: { x: number; y: number };
}

function drawColorBar(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const nDiv = 5;
  ctx.font = "20px Arial";
  const barWidth = canvas.width - 20;

  for (let x = 0; x < nDiv; x++) {
    ctx.fillStyle = turbo_r(x / nDiv);
    ctx.fillRect(
      (x * barWidth) / nDiv + 10,
      0,
      barWidth / nDiv,
      canvas.height / 2
    );
  }
  for (const x of [0, 10, 20, 30, 40, 50]) {
    const xPos = (x / 50) * barWidth + 10;
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(xPos, 30);
    ctx.lineTo(xPos, 20);
    ctx.stroke();

    const textM = ctx.measureText(x.toString());

    ctx.fillText(x.toString(), xPos - textM.width / 2, 50);
  }
}

const roundTo10 = (x: number) => Math.floor(x / 10) * 10;

interface SearchInterface {
  searchHandler: (lat: number, lon: number) => Promise<void>;
}

const SearchField = ({ searchHandler }: SearchInterface) => {
  const provider = new OpenStreetMapProvider({
    params: {
      "accept-language": "fi",
      countrycodes: "FI",
      viewbox: "24.443550,60.119711,25.332069,60.410813",
      bounded: 1,
    },
  });

  const searchControl: Control = GeoSearchControl({
    style: "bar",
    provider: provider,
    showMarker: false,
    retainZoomLevel: true,
    searchLabel: "Destination address",
  });

  const locationHandler = (result: LeafletEvent) => {
    const lon = (result as GeoEvent).location.x;
    const lat = (result as GeoEvent).location.y;
    void searchHandler(lat, lon);
  };

  const map = useMap();

  useEffect(() => {
    map.addControl(searchControl);
    map.on("geosearch/showlocation", locationHandler);
    return () => {
      void map.removeControl(searchControl);
      map.off("geosearch/showlocation");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

function App() {
  const [grid, setGrid] = useState<GridItem[] | null>(null);
  const [targetId, setTargetId] = useState<number>(-1);
  const [timeData, setTimeData] = useState<Map<number, number> | null>(null);

  const getGrid = async () => {
    const { data } = await apiClient.get<GridItem[]>("/grid");
    setGrid(data);
  };

  const updateClosest = async (lat: number, lon: number) => {
    const { data } = await apiClient.get<GridId>(
      "/closest?lat=" + lat + "&lon=" + lon
    );
    //console.log(data);
    setTargetId(data.id);
    //setGrid(data);
  };

  const getTimes = async () => {
    const { data } = await apiClient.get<TimeItem[]>(
      "/times?to_id=" + targetId
    );
    const timeMap = new Map<number, number>();
    let maxVal = 0;
    data.map((item) => {
      maxVal = Math.max(maxVal, item.pt_r_avg);
      timeMap.set(item.from_id, item.pt_r_avg !== null ? item.pt_r_avg : -1);
    });
    setTimeData(timeMap);
    //console.log("Max:", maxVal, "Size:", timeMap.size);
  };

  useEffect(() => {
    void getGrid();
    //void getTimes();
  }, []);

  useEffect(() => {
    if (targetId < 0) return;
    void getTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const colorGrid = (item: GridItem) => {
    try {
      const styleDef: PathOptions = {
        stroke: false,
        fillOpacity: timeData ? 0.5 : 0,
        fillColor: timeData
          ? turbo_r(roundTo10(timeData.get(item.id)!) / 50)
          : turbo_r(0),
      };
      return (
        <GeoJSON key={item.id} data={item.st_asgeojson} style={styleDef} />
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      //console.log(error);
    }
  };

  return (
    <>
      <h1>Public transport travel times</h1>
      <div>
        <MapContainer
          className="map"
          center={[60.1756, 24.9342]}
          zoom={11}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {grid?.map(colorGrid)}
          {<SearchField searchHandler={updateClosest} />}
        </MapContainer>
      </div>
      <div>
        <h2>Travel time in minutes</h2>
      </div>
      <div>
        <Canvas width={532} height={50} draw={drawColorBar} />
      </div>
    </>
  );
}

export default App;

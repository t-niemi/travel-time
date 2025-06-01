import express from "express";
import compression from "compression";
import middleware from "./utils/middleware";
import db from "./utils/connect";
import format from "pg-format";

const app = express();
app.use(express.json());
app.use(compression());
app.use(express.static("dist"));

app.get("/api/ping", (_req, res) => {
  //console.log("someone pinged here");
  res.send("pong");
});

interface GridId {
  id: string;
}

interface GridItem extends GridId {
  st_asgeojson: string;
}

interface ClosestItem extends GridId {
  dist: number;
}

interface TimeItem {
  from_id: number;
  pt_r_avg: number;
}

const isString = (text: unknown): text is string => {
  return typeof text === "string" || text instanceof String;
};

const parseToId = (to_id: unknown, paramName = "to_id"): string => {
  if (!to_id || !isString(to_id) || isNaN(parseInt(to_id))) {
    throw new Error("Incorrect or missing " + paramName);
  }

  return to_id;
};

app.get("/api/grid", async (_req, res) => {
  const grid = await db.query<GridItem>(
    "SELECT id, ST_AsGeoJSON(ST_Transform(wkb_geometry,4326)) FROM grid;",
    []
  );

  //console.log(grid.rows[0]);

  const rows = grid.rows.map((item) => ({
    id: parseInt(item.id),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    st_asgeojson: JSON.parse(item.st_asgeojson),
  }));
  res.send(rows);
});

app.get("/api/times", async (req, res) => {
  try {
    const to_id = parseToId(req.query.to_id);
    const grid = await db.query<TimeItem>(
      "SELECT from_id, pt_r_avg FROM times WHERE to_id=$1;",
      [to_id]
    );

    /*
    SELECT from_id, MAX(pt_r_avg) FROM times WHERE value IN (value1,value2,...) GROUP BY from_id ORDER BY from_id;
    */
    //console.log(grid.rows[0]);
    res.send(grid.rows);
  } catch (error: unknown) {
    let errorMessage = "Something went wrong.";
    if (error instanceof Error) {
      errorMessage += " Error: " + error.message;
    }
    res.status(400).send(errorMessage);
  }
});

app.get("/api/closest", async (req, res) => {
  try {
    const lat = parseToId(req.query.lat, "lat");
    const lon = parseToId(req.query.lon, "lon");
    const point = "SRID=4326;POINT(" + lon + " " + lat + ")";
    const query = format(
      "SELECT id, \
      wkb_geometry <-> ST_Transform(%L::geometry, 3067) AS dist \
      FROM grid \
      ORDER BY dist \
      LIMIT 1;",
      point
    );

    const closestId = (await db.query<ClosestItem>(query, [])).rows[0];
    res.send({ id: closestId.id, dist: closestId.dist });
  } catch (error: unknown) {
    let errorMessage = "Something went wrong.";
    if (error instanceof Error) {
      errorMessage += " Error: " + error.message;
    }
    res.status(400).send(errorMessage);
  }
});

app.use(middleware.unknownEndpoint);

export default app;

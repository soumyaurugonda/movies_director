const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//API1
const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT
        movie_name
        FROM
        movie;`;
  const movieNamesArray = await db.all(getMovieNamesQuery);
  response.send(
    movieNamesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

///API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `
  insert into movie(director_id,movie_name,lead_actor) 
  values(${directorId},'${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await db.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

///API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
     SELECT 
     * 
     FROM 
     movie
     WHERE 
       movie_id=${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

///API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
      UPDATE 
       movie 
      SET 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
        WHERE 
         movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

///API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  delete from movie 
  where movie_id = ${movieId};`;
  const deleteMovieQueryResponse = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

///api 6
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
      SELECT 
        * 
        FROM 
         director;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

///API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `
      SELECT 
        movie_name as movieName
        FROM 
        movie
    WHERE 
      director_id=${directorId};`;
  const directorArray = await db.all(getMoviesByDirectorQuery);
  response.send(directorArray);
});
module.exports = app;

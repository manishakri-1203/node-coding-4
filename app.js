const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// get players API

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
  SELECT *
  FROM cricket_team;`

  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

// Add Players API

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO
  cricket_team (playerName, jerseyNumber, role)
  VALUES (
    ${playerName},
    ${jerseyNumber},
    ${role}
  );`
  const dbResponse = await db.run(addPlayerQuery)
  //console.log(dbResponse)
  response.send('Player Added to Team')
})

// Returns a player based on a player ID

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT *
  FROM cricket_team
  WHERE player_id = ${playerId};`
  const player = await db.run(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

// Update Player API

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerQuery = `
  UPDATE cricket_team
  SET
  player_name = ${playerName},
  jersey_number = ${jerseyNumber},
  role = ${role}
  WHERE player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// Remove Player API

app.delete('/players/:playerId/', async (request, response) => {
  const playerId = request.params
  const deletePlayerQuery = `
  DELETE FROM 
  cricket_team
  WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app;

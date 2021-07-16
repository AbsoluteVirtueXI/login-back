const express = require('express')
const { Database } = require('./db')

const IP_LOOPBACK = 'localhost'
const IP_LOCAL = '192.168.0.10' // my local ip on my network
const PORT = 3333
const app = express()
const db = new Database('users.json')

app.use(express.urlencoded({ extended: false })) // to support URL-encoded bodies
app.use(express.json()) // to support JSON-encoded bodies

app.post('/login', (req, res) => {
  try {
    const username = req.body.username
    const hash = req.body.hash
    // db.hashOf throw if username does not exist
    if (db.hashOf(username) === hash) {
      res.send({ code: 200 })
    } else {
      res
        .status(403)
        .send({ code: 403, message: 'username or password incorrect' })
    }
  } catch (e) {
    if (e.code === 'USER_NO_EXIST') {
      res
        .status(403)
        .send({ code: 403, message: 'username or password incorrect' })
    } else {
      res.send({
        code: 500,
        message: 'An internal error occured. Please contact the administrator.',
      })
    }
  }
})

app.post('/register', async (req, res) => {
  const username = req.body.username
  const hash = req.body.hash
  try {
    const result = await db.insert(username, hash)
    res.status(200).send({ code: 200 })
  } catch (e) {
    if (e.code === 'USER_EXISTS') {
      res.status(403).send({
        code: 403,
        message: `Registration failed, ${username} already exists`,
      })
    } else {
      res.status(500).send({
        code: 500,
        message: 'An internal error occured. Please contact the administrator.',
      })
    }
  }
})

app.post('/unregister', (req, res) => {})

// start the server
app.listen(PORT, IP_LOCAL, () => {
  console.log(`Login app listening at http://${IP_LOCAL}:${PORT}`)
})

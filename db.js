const fs = require('fs')
const asyncFs = require('fs/promises')

const JSON_FILE_NAME = 'users.json'

const ERROR_USER_EXISTS = {
  code: 'USER_EXISTS',
  errno: 1,
  message: 'user already exists',
}
const ERROR_USER_DOES_NOT_EXIST = {
  code: 'USER_NO_EXIST',
  errno: 2,
  message: 'user does not exist',
}

class DatabaseError extends Error {
  constructor(error) {
    super(error.message)
    this.name = 'DatabaseError'
    this.code = error.code
    this.errno = error.errno
  }
  toString() {
    return `${this.name} ${this.code}: ${this.message}`
  }
}

class Database {
  constructor(jsonFileName) {
    this.jsonFileName = jsonFileName
    if (fs.existsSync(jsonFileName)) {
      const jsonContent = fs.readFileSync(jsonFileName)
      this._users = JSON.parse(jsonContent)
    } else {
      this._users = {}
    }
  }

  async insert(username, hash) {
    if (this._users.hasOwnProperty(username)) {
      throw new DatabaseError(ERROR_USER_EXISTS)
    } else {
      this._users[username] = hash
      await asyncFs.writeFile(
        this.jsonFileName,
        JSON.stringify(this._users),
        'utf-8'
      )
      return true
    }
  }

  async delete(username) {
    if (this._users.hasOwnProperty(username)) {
      delete this._users[username]
      await asyncFs.writeFile(
        this.jsonFileName,
        JSON.stringify(this._users),
        'utf-8'
      )
      return true
    } else {
      throw new DatabaseError(ERROR_USER_DOES_NOT_EXIST)
    }
  }

  hashOf(username) {
    if (this._users.hasOwnProperty(username)) {
      return this._users[username]
    } else {
      throw new DatabaseError(ERROR_USER_DOES_NOT_EXIST)
    }
  }

  get users() {
    return { ...this._users }
  }
}

exports.Database = Database

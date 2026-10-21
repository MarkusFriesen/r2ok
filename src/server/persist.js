const fs = require('fs')
const winston = require('winston')

const persisters = []

// Creates a writer for one file. Calls to schedule() are batched: at most one write per
// delayMs, and only if the serialized data actually changed since the last write.
// The delay bounds how much a hard crash can lose, normal exits flush immediately.
const createPersister = (filePath, getData, delayMs) => {
  let timer = null
  let dirty = false
  let lastWritten

  const write = () => {
    clearTimeout(timer)
    timer = null
    if (!dirty) return
    dirty = false

    const content = JSON.stringify(getData())
    if (content === lastWritten) return

    try {
      // Write to a temp file first, so a crash mid-write can't corrupt the stored state
      fs.writeFileSync(`${filePath}.tmp`, content)
      fs.renameSync(`${filePath}.tmp`, filePath)
      lastWritten = content
    } catch (err) {
      dirty = true
      winston.error(`[persist] Failed to save state to file ${filePath}`, err)
    }
  }

  const schedule = () => {
    dirty = true
    if (!timer) timer = setTimeout(write, delayMs)
  }

  persisters.push(write)
  return {schedule, flush: write}
}

const flushAll = () => persisters.forEach(flush => flush())

process.on('exit', flushAll)
;['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => process.exit(0)))

module.exports = {createPersister}

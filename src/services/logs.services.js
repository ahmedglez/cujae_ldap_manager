const Log = require('../schemas/logs.schema')

const createLog = async (logData) => {
  return await Log.create(logData)
}

const getAllLogs = async () => {
  return await Log.find()
}

const filterLogs = async (query) => {
  // Construir un objeto de filtro basado en el query recibido
  const filter = {}
  if (query.method) filter.message = new RegExp(`method: '${query.method}'`)
  if (query.url) filter.message = new RegExp(`url: '${query.url}'`)
  if (query.status) filter.message = new RegExp(`status: '${query.status}'`)
  if (query.user) filter.message = new RegExp(`user: '${query.user}'`)

  // Realizar la búsqueda de logs con el filtro
  const logs = await Log.find(filter)

  // Si deseas filtrar múltiples campos a la vez (por ejemplo, method y url), puedes usar el operador $and
  // const logs = await Log.find({
  //   $and: [
  //     { message: new RegExp(`method: '${query.method}'`) },
  //     { message: new RegExp(`url: '${query.url}'`) }
  //   ]
  // });

  // Devolver los logs filtrados
  return logs
}

module.exports = {
  createLog,
  getAllLogs,
  filterLogs,
}

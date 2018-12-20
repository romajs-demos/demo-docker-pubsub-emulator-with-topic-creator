const { PubSub } = require('@google-cloud/pubsub')
const waitPort = require('wait-port')
const topics = require('./topics.json')

const {
  PUBSUB_EMULATOR_HOST: emulatorHost,
  PUBSUB_PROJECT_ID: projectId
} = process.env

console.log('Environment variables:', process.env)

console.log('Used variables:', {
  emulatorHost,
  projectId
})

const [host, port] = emulatorHost.split(':')
const pubsubClient = new PubSub({ projectId })

const createTopics = (topics = []) => Promise.all(topics.map(({ name }) => {
  console.log(`Creating topic "${name}"...`)
  return pubsubClient.createTopic(name)
    .then(results => {
      const topic = results[0]
      console.log(`Created topic "${name}" successfully.`)
      return Promise.resolve(name)
    })
    .catch(err => {
      console.error(`Error creating topic "${name}"`, err)
      console.trace()
      return Promise.reject(err)
    })
}))

waitPort({ host, port: parseInt(port) }).then(() => {
  console.log('Topics:')
  console.table(topics)
  return createTopics(topics).then(() => {
    console.log('Every topic was created successfully.')
  }).catch((err = {}) => {
    process.exit(err.code || -1)
  })
})

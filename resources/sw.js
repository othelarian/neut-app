
self.addEventListener('install', _evt => {
  self.skipWaiting()
  console.log('sw installed')
})

self.addEventListener('message', async evt => {
  console.log(evt.data)
  console.log('log from the serviceWorker')
  evt.ports[0].postMessage('plip')
})

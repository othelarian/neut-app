/*
  Function to display information about the Neutralino app.
  This function updates the content of the 'info' element in the HTML
  with details regarding the running Neutralino application, including
  its ID, port, operating system, and version information.
*/
function showInfo() {
  const info = `
    ${NL_APPID} is running on port ${NL_PORT} inside ${NL_OS}
    - server: v${NL_VERSION} . client: v${NL_CVERSION}
  `
  console.log(info)
}

function openDocs() {
  Neutralino.os.open("https://neutralino.js.org/docs")
}

function setTray() {
  // Tray menu is only available in window mode
  if(NL_MODE != "window") {
    console.log("INFO: Tray menu is only available in the window mode.")
    return
  }

  // Define tray menu items
  let tray = {
    icon: "/resources/icons/trayIcon.png",
    menuItems: [
      {id: "VERSION", text: "Get version"},
      {id: "SEP", text: "-"},
      {id: "QUIT", text: "Quit"}
    ]
  }

  // Set the tray menu
  Neutralino.os.setTray(tray)
}

function onTrayMenuItemClicked(event) {
  switch(event.detail.id) {
    case "VERSION":
      // Display version information
      Neutralino.os.showMessageBox("Version information",
        `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`)
      break
    case "QUIT":
      // Exit the application
      Neutralino.app.exit()
      break
    }
}

function onWindowClose() { Neutralino.app.exit() }

function toggle(id, dir) {
  document.querySelector(id).style.display = (dir)? 'block' : 'none'
}

async function appInit() {
  Neutralino.init();
  Neutralino.events.on("windowClose", onWindowClose)
  showInfo()
  // check for the sw
  if (navigator && navigator.serviceWorker) {
    let registration = await navigator.serviceWorker.getRegistration()
    toggle(((!registration)? '#launch-sw' : '#sw-working'), true)
  } else {
    toggle('#no-sw', true)
    alert('ServiceWorker is not available on this neutralino app!')
  }
}

function tryAlert() { alert('this is the try alert') }

function startSystray() {
  Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked)
  if(NL_OS != "Darwin") { setTray() }
}

let sw;
async function launchSW() {
  console.log('try launching the sw')
  toggle('#launch-sw', false)
  toggle('#sw-launching', true)
  try {
    navigator.serviceWorker.register('js/sw.js')
    console.log('register ok')
    const rdy = await navigator.serviceWorker.ready
    console.log('ready ok')
    if (rdy.active.state != 'activated') {
      await new Promise((res) => {
        const listener = () => {
          rdy.active.removeEventListener('statechange', listener)
          sw = rdy.active;
          res()
        }
        rdy.active.addEventListener('statechange', listener)
      })
    }
    alert('Sw launched!')
    toggle('#sw-launching', false)
    toggle('#sw-working', true)
  } catch (err) {
    //
    console.log(err)
    //
  }
}

async function callSW() {
  console.log('call sw')
  await new Promise((res) => {
    const messageChannel = new MessageChannel()
    messageChannel.port1.onmessage = (evt) => {
      console.log('answer from sw')
      console.log(evt.data)
      res(evt.data)
    }
    sw.postMessage('plop', [messageChannel.port2])
  })
}

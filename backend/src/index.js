import { app,http_server } from './app.js'



const port = 3000

http_server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
import express from "express"

const app = express()

app.use(express.static("dist"))

app.listen(6969, () => {
  console.info("http://localhost:6969")
})

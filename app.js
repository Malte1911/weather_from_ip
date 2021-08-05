const { default: axios } = require("axios");
const dotenv = require("dotenv");
const express = require("express");
const app = express();
const path = require("path");
const stringify = require("json-stringify-safe");

dotenv.config();

const port = process.env.PORT;

app.use(express.json());

app.post("/endpoint", async (req, res) => {
  app.set("trust proxy", true);
  if (!req.body["ip"]) {
    console.log(req.body["ip"]);
    res
      .status(400)
      .send("No/Wrong Notation for the IP-address which should be processed")
      .end();
  } else {
    client_ip = req.body["ip"];
    if (
      !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        client_ip
      )
    ) {
      res.status(400).send("Unprocessable IP-address").end();
    } else {
      axios
        .get(`http://ip-api.com/json/${client_ip}`)
        .then((response_tracer) => {
          console.log(response_tracer["data"]);
          axios
            .post(
              `https://api.openweathermap.org/data/2.5/forecast?zip=${response_tracer["data"]["zip"]},${response_tracer["data"]["countryCode"]}&appid=${process.env.API_KEY_WEATHER}`
            )
            .then((response_weather) => {
              const weather_final = stringify(response_weather["data"]);
              res.status(200).send(weather_final).end();
            })
            .catch((error) => {
              console.log(error);
              res.send(error);
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(400).send("Geotracer API not working").end();
        });
    }
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
  console.log("sent html to user");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

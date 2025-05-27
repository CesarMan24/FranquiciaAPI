const express = require("express"); //npm install express
const cors = require("cors"); //npm install cors
const fs = require("fs");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const QUEUE_URL =
  "https://sqs.us-east-1.amazonaws.com/165173101233/ventasparafranquicia";

const app = express();
const PORT = 4001;
app.use(cors());
app.use(express.json());

const leerJSON = () => {
  const data = fs.readFileSync("franquicia.json", "utf8");
  return JSON.parse(data);
};

// Función para escribir en FRANQ.json
const escribirJSON = (data) => {
  fs.writeFileSync("franquicia.json", JSON.stringify(data, null, 2), "utf8");
};

app.get("/franquicia", (req, res) => {
  //get todo
  res.json(leerJSON());
});

app.get("/franquicia/ventasTotales", (req, res) => {
  //get todo
  res.json(leerJSON().franquicia.ventasTotales);
});
setInterval(() => {
  sqs.receiveMessage(params, (err, data) => {
    if (err) {
      errores.push(err.message);
    } else if (data.Messages) {
      // Leer el JSON una sola vez por ciclo
      let franquiciaData = leerJSON();
      data.Messages.forEach((msg) => {
        const venta = JSON.parse(msg.Body);
        mensajesRecibidos.push(venta);
        // Agregar venta a ventasTotales
        franquiciaData.franquicia.ventasTotales.push(venta);

        // Eliminar mensaje de la cola
        const deleteParams = {
          QueueUrl: QUEUE_URL,
          ReceiptHandle: msg.ReceiptHandle,
        };
        sqs.deleteMessage(deleteParams, (err) => {
          if (err) errores.push("Delete Error: " + err.message);
        });
      });
      // Guardar cambios en el JSON
      escribirJSON(franquiciaData);
    }
  });
}, 5000);
//});
app.listen(PORT, (err) => {
  //console.log(err);
  console.log(`app listening on port ${PORT}`);
});

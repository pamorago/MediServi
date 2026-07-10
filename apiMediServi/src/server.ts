import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();
// Acceder a la configuracion del archivo .env
dotenv.config();
// Puerto que escucha por defecto 300 o definido .env
const port = process.env.PORT || 3000;
// Middleware CORS para aceptar llamadas en el servidor
app.use(cors());
// Middleware para loggear las llamadas al servidor
app.use(morgan("dev"));
// Middleware para gestionar Requests y Response json
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.json({
    message: "API de MediServi funcionando correctamente",
  });
});

// Servir imágenes de perfil como archivos estáticos
app.use("/images", express.static(path.join(path.resolve(), "assets", "uploads")));

// Rutas de la API
app.use("/api", routes);

// Handle errors middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log("Presione CTRL-C para detenerlo\n");
});

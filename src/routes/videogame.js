const { Router } = require("express");
const router = Router();
const { Op, where } = require("sequelize");
const { Videogame, Genre } = require("../db");
const axios = require("axios");
const { API_KEY } = process.env;
const { get100Videogame } = require("./auxiliars");

router.get("/", async (req, res, next) => {
  const { name } = req.query;
  let videogameApi, dbGameFiltered;
  try {
    if (name) {
      const dbGame = await Videogame.findAll({
        include: [
          {
            model: Genre,
            through: { attributes: [] },
            attributes: ["name"],
          },
        ],
        where: {
          name: {
            [Op.iLike]: "%" + name + "%",
          },
        },
        attributes: ["id", "name", "rating", "background_image", "created"],
      });

      dbGameFiltered = dbGame.map((el) => {
        const obj = {
          id: el.id,
          image: el.background_image,
          name: el.name,
          rating: el.rating,
          genres: el.genres.map((el) => {
            return el.name + " ";
          }),
          created: el.created,
        };
        return obj;
      });

      let resApi = await axios.get(
        `https://api.rawg.io/api/games?key=${API_KEY}&search=%7B${name}%7D`
      );

      let arrayApiFiltered = [...resApi.data.results];
      arrayApiFiltered = arrayApiFiltered.slice(0, 15 - dbGameFiltered.length);

      videogameApi = arrayApiFiltered.map((el) => {
        const obj = {
          id: el.id,
          image: el.background_image,
          name: el.name,
          rating: el.rating,
          platforms: el.platforms
            .map((p) => {
              return p.platform.name;
            })
            .join(", "),

          genres: el.genres.map((el) => {
            return el.name + " ";
          }),
        };
        return obj;
      });
    } else {
      const dbGame = await Videogame.findAll({
        include: [
          {
            model: Genre,
            through: { attributes: [] },
            attributes: ["name"],
          },
        ],

        attributes: ["id", "name", "rating", "background_image", "created"],
      });

      dbGameFiltered = dbGame.map((el) => {
        const obj = {
          id: el.id,
          image: el.background_image,
          name: el.name,
          rating: el.rating,
          genres: el.genres.map((el) => {
            return el.name + " ";
          }),
          created: el.created,
        };
        return obj;
      });

      let resApi = await get100Videogame();

      videogameApi = resApi.map((el) => {
        const obj = {
          id: el.id,
          image: el.background_image,
          name: el.name,
          rating: el.rating,
          platforms: el.platforms
            .map((p) => {
              return p.platform.name;
            })
            .join(", "),

          genres: el.genres.map((el) => {
            return el.name + " ";
          }),
        };
        return obj;
      });
    }

    let final = [...dbGameFiltered, ...videogameApi];

    res.send(final);
  } catch (error) {
    next(error);
  }
});
//----------------------------------

// Ruta 3 -- [ ] GET /videogame/{idVideogame}:
// Obtener el detalle de un videojuego en particular
// Debe traer solo los datos pedidos en la ruta de detalle de videojuego
// Incluir los géneros asociados

// Ruta de detalle de videojuego: debe contener

// [ ] Los campos mostrados en la ruta principal para cada videojuegos (imagen, nombre, y géneros)
// [ ] Descripción
// [ ] Fecha de lanzamiento
// [ ] Rating
// [ ] Plataformas

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let game;
    if (typeof id === "string" && id.length > 15) {
      game = await Videogame.findByPk(id, {
        attributes: [
          "name",
          "background_image",
          "released",
          "rating",
          "description",
          "platforms",
        ],
        include: [
          {
            model: Genre,
            through: { attributes: [] },
            attributes: ["name"],
          },
        ],
      });
    } else {
      let response = await axios.get(
        `https://api.rawg.io/api/games/${id}?key=${API_KEY}`
      );

      let obj = {
        name: response.data.name,
        background_image: response.data.background_image,
        released: response.data.released,
        rating: response.data.rating,
        description: response.data.description_raw,
        platforms: response.data.platforms.map((el) => {
          return el.platform.name + " ";
        }),
        genres: response.data.genres.map((el) => {
          return {
            name: el.name,
          };
        }),
      };

      game = obj;
    }
    res.send(game);
  } catch (error) {
    next(error);
  }
});

// Ruta 4 -- [ ] POST /videogame:
// Recibe los datos recolectados desde el formulario controlado de la ruta de creación de videojuego por body
// Crea un videojuego en la base de datos

router.post("/", async (req, res, next) => {
  try {
    let {
      name,
      description,
      released,
      rating,
      platforms,
      background_image,
      genres,
    } = req.body;

    if (!background_image) {
      background_image =
        "https://media.rawg.io/media/games/25d/25d9592abbd02dccd67d83108ae79582.jpg";
    }

    let newVideogame = await Videogame.create({
      name,
      description,
      released,
      rating,
      platforms,
      background_image,
    });

    let dbGenre = await Genre.findAll({
      where: { name: genres },
    });

    await newVideogame.addGenre(dbGenre);
    res.send(newVideogame);
  } catch (err) {
    next(err);
  }
});

// Ruta de creación de videojuegos: debe contener
// [ ] Un formulario controlado con JavaScript con los siguientes campos:
// Nombre
// Descripción
// Fecha de lanzamiento
// Rating
// [ ] Posibilidad de seleccionar/agregar varios géneros
// [ ] Posibilidad de seleccionar/agregar varias plataformas
// [ ] Botón/Opción para crear un nuevo videojuego

module.exports = router;

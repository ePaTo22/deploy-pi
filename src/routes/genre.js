const { default: axios } = require("axios");
const { Router } = require("express");
const router = Router();
const { Genre } = require("../db");
const { API_KEY } = process.env;

// Ruta Genres -- [ ] GET /genres:
// Obtener todos los tipos de géneros de videojuegos posibles
// En una primera instancia deberán traerlos desde rawg y guardarlos en su propia base de datos y luego ya utilizarlos desde allí

async function getGenres() {
  let genresAPI = await axios
    .get(`https://api.rawg.io/api/genres?key=${API_KEY}`)
    .then((e) => {
      let genres = e.data.results.map(async (genre) => {
        await Genre.findOrCreate({
          where: { id: genre.id, name: genre.name },
        });
      });
    });
}

router.get("/", async (req, res, next) => {
  try {
    let genresDB = await Genre.findAll({});
    if (genresDB.length < 2) {
      await getGenres();
      genresDB = await Genre.findAll({});
    }

    return res.send(genresDB);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// async function getGenres() {
//   let arr = [];
//   let response = await axios.get(
//     `https://api.rawg.io/api/genres?key=${API_KEY}`
//   );

//   response.data.results.forEach((el) => {
//     arr.push(el.name);
//   });

//   let arr2 = arr.map((el) => ({ name: el }));

//   const allGenres = await Genre.bulkCreate(arr2);
// }

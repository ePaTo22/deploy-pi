const axios = require("axios");
const { API_KEY } = process.env;

async function get100Videogame() {
  let videogameApi,
    arr = [],
    url;
  videogameApi = await axios.get(
    `https://api.rawg.io/api/games?key=${API_KEY}`
  );
  arr = [...arr, ...videogameApi.data.results];

  for (let i = 1; i < 5; i++) {
    // cambio a 2 el for para no hacer tantas peticiones y hacer mas rapido el front
    url = videogameApi.data.next;
    videogameApi = await axios.get(url);
    arr = [...arr, ...videogameApi.data.results];
  }
  return arr; // slicep 15 para ver como se tednria que ver cuando haga el paginado
}

module.exports = {
  get100Videogame,
};

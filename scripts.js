const API_KEY = "959cd624bbbbe60eed7eb4ff99eb2680";
const HASH = "c22540c6c582bb9dfa2866bcc5b95069";

const spanError = document.querySelector(".error-msg");
const button = document.querySelector(".submit");
button.addEventListener("click", handleSubmit);
const heroesContainer = document.querySelector(".heroes-container");
const divpages = document.querySelector(".pages-div");

let htmlContent = "";
let offset = 0;
let current_page = 1;

let favs = JSON.parse(localStorage.getItem("favs")) || [];

function handleSubmit(e) {
  e.preventDefault();
  searchHero();
}

async function getHeroes(name = null) {
  const response = name
    ? await fetch(
        `http://gateway.marvel.com/v1/public/characters?name=${name}&ts=1&apikey=${API_KEY}&hash=${HASH}`
      )
    : await fetch(
        `http://gateway.marvel.com/v1/public/characters?offset=${offset}&ts=1&apikey=${API_KEY}&hash=${HASH}`
      );
  const json = await response.json();

  for (const hero of json.data.results) {
    draw(hero, json.data.results.length);
  }

  if (json.data.results.length == 0) {
    throwError();
  } else {
    spanError.style.display = "none";
  }
}

async function getHeroesId(id, favs) {
  const response = await fetch(
    `https://gateway.marvel.com/v1/public/characters/${id}?ts=1&apikey=${API_KEY}&hash=${HASH}`
  );
  const json = await response.json();
  for (const hero of json.data.results) {
    if (!favs) {
      drawHero(hero);
    } else {
      draw(hero, 1);
    }
  }
}

function searchHero() {
  const input = document.querySelector(".search");
  htmlContent = "";
  if (input.value) getHeroes(input.value);
}

function draw(hero, numOfHeroes) {
  numOfHeroes == 1
    ? (divpages.style.visibility = "hidden")
    : (divpages.style.visibility = "visible");

  let imgurl = `${hero.thumbnail.path}/portrait_xlarge.${hero.thumbnail.extension}`;
  let href = hero.id;

  htmlContent += ` 
    <div class="hero">
      <img src="${imgurl}" alt=${hero.name} />
      <a href="#/${href}">${hero.name}</a>
    </div>`;

  heroesContainer.innerHTML = htmlContent;
}

function drawHero(hero) {
  divpages.style.visibility = "hidden";
  let imgurl = `${hero.thumbnail.path}/portrait_xlarge.${hero.thumbnail.extension}`;

  let url1 = hero.urls[0]
    ? `<a class="footer-link" href=${hero.urls[0].url} target="_blank">${hero.urls[0].type}</a>`
    : "";
  let url2 = hero.urls[1]
    ? `<a class="footer-link" href=${hero.urls[1].url} target="_blank">${hero.urls[1].type}</a>`
    : "";
  let url3 = hero.urls[2]
    ? `<a class="footer-link" href=${hero.urls[2].url} target="_blank">${hero.urls[2].type}</a>`
    : "";

  let button = !favs.includes(hero.id)
    ? `<button class="submit" onclick="addToFav(${hero.id})">Add to favorites</button>`
    : `<button class="submit" onclick="removeFromFav(${hero.id})">Remove from favorites</button>`;

  htmlContent = `
    <div class="hero-expanded">
      <h2 class="name">${hero.name}</h2>
      <img src=${imgurl} alt=${hero.name}/>
      <p class="description"><span style="font-weight: bold;">Description: </span>${
        hero.description ? hero.description : "none"
      }</p>
      <div>
        ${url1}
        ${url2}
        ${url3}
      </div>
      ${button}
    </div>
  `;

  heroesContainer.innerHTML = htmlContent;
}

function prevPage() {
  if (current_page > 1) {
    current_page--;
    offset -= 20;
    changePage(current_page);
  }
}

function nextPage() {
  current_page++;
  offset += 20;
  changePage(current_page);
}

function changePage(page) {
  const page_span = document.querySelector(".page");

  if (page < 1) page = 1;

  htmlContent = "";
  page_span.innerHTML = page;

  getHeroes();
}

function home() {
  window.location.href = "../index.html";
  htmlContent = "";
  getHeroes();
}

window.onload = function () {
  changePage(1);
};

window.addEventListener("hashchange", () =>
  getHeroesId(location.hash.slice(2))
);

function throwError() {
  spanError.style.display = "block";
}

function addToFav(heroId) {
  if (!favs.includes(heroId)) {
    favs.push(heroId);
    setStorage();
  }
}

function removeFromFav(heroId) {
  if (favs.includes(heroId)) {
    const index = favs.indexOf(heroId);
    favs.splice(index, 1);
    setStorage();
  }
}

function setStorage() {
  localStorage.setItem("favs", JSON.stringify(favs));
}

function drawFavorites(favsId) {
  htmlContent = "";
  favsId.forEach((favId) => getHeroesId(favId, true));
}

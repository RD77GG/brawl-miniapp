const params = new URLSearchParams(window.location.search);
const name = params.get("name");

fetch("data/brawlers.json")
.then(response => response.json())
.then(brawlers => {

const brawler = brawlers.find(b => b.name === name);

document.getElementById("name").innerHTML = brawler.name;

document.getElementById("brawler").innerHTML = `

<img src="${brawler.image}" class="brawler-image">

<h2>Скины:</h2>

<div class="skins">

${brawler.skins.map(skin => `

<div class="skin-card">
<img src="${skin.image}">
<h3>${skin.name}</h3>
</div>

`).join("")}

</div>

`;

});

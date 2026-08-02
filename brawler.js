const params = new URLSearchParams(window.location.search);
const name = params.get("name");


fetch("data/brawlers.json")
.then(response => response.json())
.then(brawlers => {

const brawler = brawlers.find(b => b.name === name);


if(!brawler){
    document.getElementById("brawler").innerHTML = "Боец не найден";
    return;
}


document.getElementById("name").innerHTML = brawler.name;


document.getElementById("brawler").innerHTML = `


<div class="brawler-main">


<img src="${brawler.image}" class="main-image">


<div class="info">

<p>⭐ Редкость: ${brawler.rarity}</p>

<p>⚔️ Класс: ${brawler.class}</p>

</div>


<h2>
Титулы
</h2>


<div class="titles">

${brawler.titles.map(title => `

<div class="title-card ${title.style}">

<span>${title.name}</span>

<small>${title.prime} Прайм</small>

</div>

`).join("")}


</div>



<h2>
Скины (${brawler.skins.length})
</h2>


</div>



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

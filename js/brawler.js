const params = new URLSearchParams(window.location.search);
const name = params.get("name");


fetch("data/brawlers.json")
.then(response => response.json())
.then(brawlers => {

    const brawler = brawlers.find(b => b.name === name);


    if (!brawler) {
        document.getElementById("brawler").innerHTML =
        "<h2>Боец не найден</h2>";
        return;
    }


    document.getElementById("brawler").innerHTML = `

    <div class="brawler-main">


        <h1>${brawler.displayName}</h1>


        <img 
        src="${brawler.image}" 
        class="main-image"
        alt="${brawler.displayName}">


        <div class="info-card">

            <p>
                <strong>⭐ Редкость:</strong>
                <span class="rarity ${brawler.rarityClass}">
                    ${brawler.rarity}
                </span>
            </p>


            <p>
                <strong>⚔️ Класс:</strong>
                <span class="class-tag ${brawler.classClass}">
                    ${brawler.class}
                </span>
            </p>

        </div>



        <h2>Скины (${brawler.skins.length})</h2>


        <div class="skins">


        ${brawler.skins.map(skin => `

            <div class="skin-card">

                <img 
                src="${skin.image}"
                alt="${skin.displayName}">


                <h3>
                ${skin.displayName}
                </h3>

            </div>

        `).join("")}


        </div>


    </div>

    `;


})
.catch(error => {

    console.error(error);

    document.getElementById("brawler").innerHTML =
    "<h2>Ошибка загрузки данных</h2>";

});

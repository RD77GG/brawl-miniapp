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

        <img
            src="${brawler.image}"
            class="main-image"
            alt="${brawler.displayName}">

        <h1 class="brawler-name">
            ${brawler.displayName}
        </h1>

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

        <div class="tabs">

            <button class="tab active" id="skinsTab">
                🎨 Скины
            </button>

            <button class="tab" id="infoTab">
                📖 Информация
            </button>

        </div>

        <div id="skinsContent">

            <h2>Скины (${brawler.skins.length})</h2>

            <div class="skins">

                ${brawler.skins.map(skin => `
                    <div class="skin-card">

                        <img
                            src="${skin.image}"
                            alt="${skin.displayName}">

                        <h3>${skin.displayName}</h3>

                    </div>
                `).join("")}

            </div>

        </div>

        <div id="infoContent" style="display:none;">

            <div class="titles-card">

                <h2>🏆 Титулы</h2>

                ${brawler.titles.map(title => `
                    <p>
                        <strong>${title.prime} Прайм:</strong>
                        ${title.name}
                    </p>
                `).join("")}

            </div>

            <div class="info-card">

                <h2>⭐ Способности</h2>

                <p>⭐ Звёздные силы — скоро</p>
                <p>🔧 Гаджеты — скоро</p>
                <p>⚡ Гиперзаряд — скоро</p>

            </div>

        </div>

    </div>

    `;

    const skinsTab = document.getElementById("skinsTab");
    const infoTab = document.getElementById("infoTab");

    const skinsContent = document.getElementById("skinsContent");
    const infoContent = document.getElementById("infoContent");

    skinsTab.onclick = () => {

        skinsContent.style.display = "block";
        infoContent.style.display = "none";

        skinsTab.classList.add("active");
        infoTab.classList.remove("active");

    };

    infoTab.onclick = () => {

        skinsContent.style.display = "none";
        infoContent.style.display = "block";

        infoTab.classList.add("active");
        skinsTab.classList.remove("active");

    };

})
.catch(error => {

    console.error(error);

    document.getElementById("brawler").innerHTML =
    "<h2>Ошибка загрузки данных</h2>";

});

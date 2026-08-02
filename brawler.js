const params = new URLSearchParams(window.location.search);
const name = params.get("name");

fetch("data/brawlers.json")
.then(response => response.json())
.then(brawlers => {

    const brawler = brawlers.find(b => b.name === name);

    if (!brawler) {
        document.getElementById("brawler").innerHTML = "<h2>Боец не найден</h2>";
        return;
    }

    document.getElementById("name").textContent = brawler.displayName;

    document.getElementById("brawler").innerHTML = `

    <div class="brawler-main">

        <img src="${brawler.image}" class="main-image">

        <div class="info">
            <p>⭐ <b>Редкость:</b> ${brawler.rarity}</p>
            <p>⚔️ <b>Класс:</b> ${brawler.class}</p>
        </div>

        <h2>Титулы</h2>

        <div class="titles">
            ${brawler.titles.map(title => `
                <div class="title-card ${title.style}">
                    <span>${title.name}</span>
                    <small>${title.prime} Прайм</small>
                </div>
            `).join("")}
        </div>

        <h2>Скины (${brawler.skins.length})</h2>

    </div>

    <div class="skins">

        ${brawler.skins.map(skin => `
            <div class="skin-card">
                <img src="${skin.image}" alt="${skin.displayName}">
                <h3>${skin.displayName}</h3>
            </div>
        `).join("")}

    </div>

    `;
});

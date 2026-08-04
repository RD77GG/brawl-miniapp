const params = new URLSearchParams(window.location.search);
const name = params.get("name");

const brawlerContainer = document.getElementById("brawler");


fetch("data/brawlers.json")
    .then(response => {

        if (!response.ok) {
            throw new Error(`Ошибка загрузки JSON: ${response.status}`);
        }

        return response.json();

    })
    .then(brawlers => {

        const brawler = brawlers.find(item => item.name === name);

        if (!brawler) {
            brawlerContainer.innerHTML =
                "<h2 class=\"page-message\">Боец не найден</h2>";
            return;
        }

        const skins = Array.isArray(brawler.skins)
            ? brawler.skins
            : [];

        const titles = Array.isArray(brawler.titles)
            ? brawler.titles
            : [];

        brawlerContainer.innerHTML = `

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

                <button
                    type="button"
                    class="tab active"
                    id="skinsTab">

                    🎨 Скины

                </button>

                <button
                    type="button"
                    class="tab"
                    id="infoTab">

                    📖 Информация

                </button>

            </div>


            <div id="skinsContent">

                <h2 class="section-title">
                    Скины (${skins.length})
                </h2>

                <div class="skins">

                    ${skins.map(skin => createSkinCard(skin)).join("")}

                </div>

            </div>


            <div id="infoContent" hidden>

                <div class="titles-card">

                    <h2>🏆 Титулы</h2>

                    ${titles.map(title => `
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


        setupTabs();

        hideBrokenOptionalIcons();

    })
    .catch(error => {

        console.error(error);

        brawlerContainer.innerHTML =
            "<h2 class=\"page-message\">Ошибка загрузки данных</h2>";

    });


function createSkinCard(skin) {

    const collection = skin.collection || {};
    const rarityClass = skin.rarityClass || "unknown";
    const source = skin.source || {};
    const releaseYear = skin.releaseYear || "—";

    return `

        <article class="skin-card">

            <div class="skin-image-box">

                <img
                    src="${skin.image}"
                    class="skin-image"
                    alt="${skin.displayName}">

            </div>


            <div class="skin-card-content">

                <h3 class="skin-name">
                    ${skin.displayName}
                </h3>


                ${createCollectionMarkup(collection)}


                <div class="skin-rarity skin-rarity-${rarityClass}">
                    ${skin.rarity || "Редкость неизвестна"}
                </div>


                <div class="skin-card-footer">

                    <div class="skin-source">
                        ${createSourceMarkup(skin)}
                    </div>

                    <span class="skin-year">
                        ${releaseYear}
                    </span>

                </div>

            </div>

        </article>

    `;
}


function createCollectionMarkup(collection) {

    if (!collection.name) {
        return "";
    }

    const icon = collection.icon
        ? `
            <img
                src="${collection.icon}"
                class="collection-icon optional-icon"
                alt="">
          `
        : "";

    return `

        <div class="skin-collection">

            ${icon}

            <span>${collection.name}</span>

        </div>

    `;
}


function createSourceMarkup(skin) {

    const source = skin.source || {};
    const price = skin.price || {};


    if (source.type === "brawl_pass") {

        return createSpecialSourceMarkup(
            source.icon || "assets/collections/brawl_pass.WEBP",
            source.name || "Brawl Pass"
        );

    }


    if (source.type === "pro_pass") {

        return createSpecialSourceMarkup(
            source.icon || "assets/collections/pro_pass.WEBP",
            source.name || "Pro Pass"
        );

    }


    if (source.type === "free") {

        return `

            <span class="source-text">
                ${source.name || "Бесплатно"}
            </span>

        `;

    }


    if (source.type === "shop") {

        const prices = [];


        if (price.gems !== undefined && price.gems !== null) {

            prices.push(`

                <span class="price-item">

                    <img
                        src="assets/currencies/gems.WEBP"
                        class="currency-icon"
                        alt="Гемы">

                    <span>${price.gems}</span>

                </span>

            `);

        }


        if (price.blings !== undefined && price.blings !== null) {

            prices.push(`

                <span class="price-item">

                    <img
                        src="assets/currencies/blings.WEBP"
                        class="currency-icon"
                        alt="Блинги">

                    <span>${price.blings}</span>

                </span>

            `);

        }


        if (price.coins !== undefined && price.coins !== null) {

            prices.push(`

                <span class="price-item">

                    <img
                        src="assets/currencies/coins.WEBP"
                        class="currency-icon"
                        alt="Монеты">

                    <span>${price.coins}</span>

                </span>

            `);

        }


        return prices.length
            ? `<div class="skin-price">${prices.join("")}</div>`
            : `<span class="source-text">Цена неизвестна</span>`;

    }


    return `<span class="source-text">Способ получения неизвестен</span>`;
}


function createSpecialSourceMarkup(icon, name) {

    return `

        <div class="special-source">

            <img
                src="${icon}"
                class="source-icon"
                alt="">

            <span>${name}</span>

        </div>

    `;
}


function setupTabs() {

    const skinsTab = document.getElementById("skinsTab");
    const infoTab = document.getElementById("infoTab");

    const skinsContent = document.getElementById("skinsContent");
    const infoContent = document.getElementById("infoContent");


    skinsTab.addEventListener("click", () => {

        skinsContent.hidden = false;
        infoContent.hidden = true;

        skinsTab.classList.add("active");
        infoTab.classList.remove("active");

    });


    infoTab.addEventListener("click", () => {

        skinsContent.hidden = true;
        infoContent.hidden = false;

        infoTab.classList.add("active");
        skinsTab.classList.remove("active");

    });

}


function hideBrokenOptionalIcons() {

    document.querySelectorAll(".optional-icon").forEach(icon => {

        icon.addEventListener("error", () => {
            icon.style.display = "none";
        });

    });

}

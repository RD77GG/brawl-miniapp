const params = new URLSearchParams(window.location.search);
const name = params.get("name");

const brawlerContainer = document.getElementById("brawler");

const skinViewer = document.getElementById("skinViewer");
const skinViewerContent = document.getElementById("skinViewerContent");
const skinViewerClose = document.getElementById("skinViewerClose");
const skinViewerOverlay = document.getElementById("skinViewerOverlay");

let currentBrawler = null;
let lastFocusedSkinCard = null;
let savedScrollPosition = 0;


/* ==================================================
   Загрузка данных
   ================================================== */

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

            brawlerContainer.innerHTML = `
                <h2 class="page-message">
                    Боец не найден
                </h2>
            `;

            return;
        }

        currentBrawler = brawler;

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

                        ${skins
                            .map((skin, index) =>
                                createSkinCard(skin, index)
                            )
                            .join("")}

                    </div>

                </div>


                <div id="infoContent" hidden>

                    <div class="titles-card">

                        <h2>🏆 Титулы</h2>

                        ${titles
                            .map(title => `

                                <p class="${title.style || ""}">

                                    <strong>
                                        ${title.prime} Прайм:
                                    </strong>

                                    ${title.name}

                                </p>

                            `)
                            .join("")}

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
        setupSkinCards();
        hideBrokenOptionalIcons();

    })
    .catch(error => {

        console.error(error);

        brawlerContainer.innerHTML = `

            <h2 class="page-message">
                Ошибка загрузки данных
            </h2>

        `;

    });


/* ==================================================
   Карточка скина в общем списке
   ================================================== */

function createSkinCard(skin, index) {

    const collection = skin.collection || {};
    const cardRarity = skin.secondaryRarity
    ? {
        name: skin.secondaryRarity.name,
        class: skin.secondaryRarity.class || "unknown"
      }
    : {
        name: skin.rarity || "Редкость неизвестна",
        class: skin.rarityClass || "unknown"
      };
    const releaseYear = skin.releaseYear || "—";

    return `

        <article
            class="skin-card"
            data-skin-index="${index}"
            tabindex="0"
            role="button"
            aria-label="Открыть ${skin.displayName}">

            <div class="skin-image-box">

                <img
                    src="${skin.image}"
                    class="skin-image"
                    alt="${skin.displayName}"
                    loading="lazy">

            </div>


            <div class="skin-card-content">

                <h3 class="skin-name">
                    ${skin.displayName}
                </h3>


                ${createCollectionMarkup(collection)}


                <div class="skin-rarity skin-rarity-${cardRarity.class}">
                    ${cardRarity.name}
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


/* ==================================================
   Основная коллекция в маленькой карточке
   ================================================== */

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

            <span>
                ${collection.name}
            </span>

        </div>

    `;
}


/* ==================================================
   Стоимость и способ получения
   ================================================== */

function createSourceMarkup(skin, viewer = false) {

    const source = skin.source || {};
    const price = skin.price || {};

    const iconClass = viewer
        ? "viewer-currency-icon"
        : "currency-icon";

    const priceItemClass = viewer
        ? "viewer-price-item"
        : "price-item";

    const priceContainerClass = viewer
        ? "viewer-price"
        : "skin-price";


    if (source.type === "brawl_pass") {

        return createSpecialSourceMarkup(
            source.icon || "assets/collections/brawl_pass.WEBP",
            source.name || "Brawl Pass",
            viewer
        );

    }


    if (source.type === "pro_pass") {

        return createSpecialSourceMarkup(
            source.icon || "assets/collections/pro_pass.WEBP",
            source.name || "Pro Pass",
            viewer
        );

    }


    if (source.type === "free") {

        return `

            <span class="${viewer
                ? "viewer-source-text"
                : "source-text"}">

                ${source.name || "Бесплатно"}

            </span>

        `;

    }


    if (source.type === "shop") {

        const prices = [];


        if (
            price.gems !== undefined &&
            price.gems !== null
        ) {

            prices.push(`

                <span class="${priceItemClass}">

                    <img
                        src="assets/currencies/gems.WEBP"
                        class="${iconClass}"
                        alt="Гемы">

                    <span>
                        ${price.gems}
                    </span>

                </span>

            `);

        }


        if (
            price.blings !== undefined &&
            price.blings !== null
        ) {

            prices.push(`

                <span class="${priceItemClass}">

                    <img
                        src="assets/currencies/blings.WEBP"
                        class="${iconClass}"
                        alt="Блинги">

                    <span>
                        ${price.blings}
                    </span>

                </span>

            `);

        }


        if (
            price.coins !== undefined &&
            price.coins !== null
        ) {

            prices.push(`

                <span class="${priceItemClass}">

                    <img
                        src="assets/currencies/coins.WEBP"
                        class="${iconClass}"
                        alt="Монеты">

                    <span>
                        ${price.coins}
                    </span>

                </span>

            `);

        }


        if (!prices.length) {

            return `

                <span class="${viewer
                    ? "viewer-source-text"
                    : "source-text"}">

                    Цена неизвестна

                </span>

            `;

        }


        return `

            <div class="${priceContainerClass}">
                ${prices.join("")}
            </div>

        `;

    }


    return `

        <span class="${viewer
            ? "viewer-source-text"
            : "source-text"}">

            Способ получения неизвестен

        </span>

    `;
}


/* ==================================================
   Brawl Pass и Pro Pass
   ================================================== */

function createSpecialSourceMarkup(
    icon,
    sourceName,
    viewer = false
) {

    return `

        <div class="${viewer
            ? "viewer-special-source"
            : "special-source"}">

            <img
                src="${icon}"
                class="${viewer
                    ? "viewer-source-icon"
                    : "source-icon"}"
                alt="">

            <span>
                ${sourceName}
            </span>

        </div>

    `;
}


/* ==================================================
   Вкладки
   ================================================== */

function setupTabs() {

    const skinsTab = document.getElementById("skinsTab");
    const infoTab = document.getElementById("infoTab");

    const skinsContent =
        document.getElementById("skinsContent");

    const infoContent =
        document.getElementById("infoContent");


    if (
        !skinsTab ||
        !infoTab ||
        !skinsContent ||
        !infoContent
    ) {
        return;
    }


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


/* ==================================================
   Нажатие на карточки скинов
   ================================================== */

function setupSkinCards() {

    document
        .querySelectorAll(".skin-card")
        .forEach(card => {

            const index = Number(
                card.dataset.skinIndex
            );


            card.addEventListener("click", () => {

                lastFocusedSkinCard = card;
                openSkinViewer(index);

            });


            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        lastFocusedSkinCard = card;
                        openSkinViewer(index);

                    }

                }
            );

        });

}


/* ==================================================
   Открытие полноэкранного просмотрщика
   ================================================== */

function openSkinViewer(index) {

    if (
        !currentBrawler ||
        !skinViewer ||
        !skinViewerContent
    ) {
        return;
    }

    const skins = Array.isArray(currentBrawler.skins)
        ? currentBrawler.skins
        : [];

    const skin = skins[index];

    if (!skin) {
        return;
    }

    const collection = skin.collection || {};

    const secondaryCollection =
        skin.secondaryCollection || null;

    const secondaryRarity =
        skin.secondaryRarity || null;


    skinViewerContent.innerHTML = `

        <div class="viewer-image-box">

            <img
                src="${skin.image}"
                class="viewer-skin-image"
                alt="${skin.displayName}">

        </div>


        <div class="viewer-information">

            <h2
                class="viewer-skin-name"
                id="viewerSkinName">

                ${skin.displayName}

            </h2>


            <div class="viewer-collections">

                ${createViewerCollectionMarkup(
                    collection
                )}

                ${createViewerCollectionMarkup(
                    secondaryCollection,
                    true
                )}

            </div>


            <div class="viewer-rarities">

                <div class="
                    viewer-rarity
                    skin-rarity-${skin.rarityClass || "unknown"}
                ">

                    ${skin.rarity || "Редкость неизвестна"}

                </div>


                ${createSecondaryRarityMarkup(
                    secondaryRarity
                )}

            </div>


            <div class="viewer-source">

                ${createSourceMarkup(skin, true)}

            </div>


            <div class="viewer-release-date">

                <span class="viewer-label">
                    Дата выхода
                </span>

                <strong>
                    ${formatReleaseDate(
                        skin.releaseDate
                    )}
                </strong>

            </div>


            ${skin.description
                ? `

                    <div class="viewer-description">

                        <span class="viewer-label">
                            Описание
                        </span>

                        <p>
                            ${skin.description}
                        </p>

                    </div>

                `
                : ""}

        </div>

    `;


    savedScrollPosition =
        window.scrollY ||
        document.documentElement.scrollTop ||
        0;


    document.documentElement.classList.add(
        "viewer-open"
    );

    document.body.classList.add(
        "viewer-open"
    );


    document.body.style.position = "fixed";
    document.body.style.top =
        `-${savedScrollPosition}px`;

    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";


    skinViewer.classList.add("open");

    skinViewer.setAttribute(
        "aria-hidden",
        "false"
    );


    const viewerCard =
        skinViewer.querySelector(
            ".skin-viewer-card"
        );

    if (viewerCard) {
        viewerCard.scrollTop = 0;
    }


    hideBrokenOptionalIcons();


    if (skinViewerClose) {
        skinViewerClose.focus();
    }

}


/* ==================================================
   Коллекции в полноэкранном просмотре
   ================================================== */

function createViewerCollectionMarkup(
    collection,
    secondary = false
) {

    if (!collection || !collection.name) {
        return "";
    }

    const icon = collection.icon
        ? `
            <img
                src="${collection.icon}"
                class="viewer-collection-icon optional-icon"
                alt="">
        `
        : "";

    return `

        <div class="
            viewer-collection
            ${secondary
                ? "viewer-secondary-collection"
                : ""}
        ">

            ${icon}

            <span>
                ${collection.name}
            </span>

        </div>

    `;
}


/* ==================================================
   Дополнительная редкость
   ================================================== */

function createSecondaryRarityMarkup(
    secondaryRarity
) {

    if (
        !secondaryRarity ||
        !secondaryRarity.name
    ) {
        return "";
    }

    const rarityClass =
        secondaryRarity.class || "unknown";

    return `

        <div class="
            viewer-rarity
            viewer-secondary-rarity
            skin-rarity-${rarityClass}
        ">

            ${secondaryRarity.name}

        </div>

    `;
}


/* ==================================================
   Закрытие просмотрщика
   ================================================== */

function closeSkinViewer() {

    if (
        !skinViewer ||
        !skinViewer.classList.contains("open")
    ) {
        return;
    }


    skinViewer.classList.remove("open");

    skinViewer.setAttribute(
        "aria-hidden",
        "true"
    );


    document.documentElement.classList.remove(
        "viewer-open"
    );

    document.body.classList.remove(
        "viewer-open"
    );


    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";


    window.scrollTo(
        0,
        savedScrollPosition
    );


    if (lastFocusedSkinCard) {
        lastFocusedSkinCard.focus();
    }

}


/* ==================================================
   Форматирование даты
   ================================================== */

function formatReleaseDate(dateString) {

    if (!dateString) {
        return "Дата неизвестна";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(
        year,
        month,
        day
    );

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ).format(date);

}


/* ==================================================
   Скрытие сломанных необязательных иконок
   ================================================== */

function hideBrokenOptionalIcons() {

    document
        .querySelectorAll(".optional-icon")
        .forEach(icon => {

            if (
                icon.dataset.errorHandlerAdded ===
                "true"
            ) {
                return;
            }

            icon.dataset.errorHandlerAdded =
                "true";


            icon.addEventListener(
                "error",
                () => {

                    icon.style.display = "none";

                }
            );


            if (
                icon.complete &&
                icon.naturalWidth === 0
            ) {

                icon.style.display = "none";

            }

        });

}


/* ==================================================
   События закрытия просмотрщика
   ================================================== */

if (skinViewerClose) {

    skinViewerClose.addEventListener(
        "click",
        closeSkinViewer
    );

}


if (skinViewerOverlay) {

    skinViewerOverlay.addEventListener(
        "click",
        closeSkinViewer
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            skinViewer &&
            skinViewer.classList.contains("open")
        ) {

            closeSkinViewer();

        }

    }
);


/* ==================================================
   Блокировка прокрутки за просмотрщиком
   ================================================== */

document.addEventListener(
    "touchmove",
    event => {

        if (
            !skinViewer ||
            !skinViewer.classList.contains("open")
        ) {
            return;
        }

        const viewerCard =
            event.target.closest(
                ".skin-viewer-card"
            );

        if (!viewerCard) {
            event.preventDefault();
        }

    },
    {
        passive: false
    }
);

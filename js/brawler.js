const params = new URLSearchParams(window.location.search);
const name = params.get("name");

const brawlerContainer = document.getElementById("brawler");

const skinViewer = document.getElementById("skinViewer");
const skinViewerContent = document.getElementById("skinViewerContent");
const skinViewerClose = document.getElementById("skinViewerClose");
const skinViewerOverlay = document.getElementById("skinViewerOverlay");

let currentBrawler = null;
let currentSkinIndex = 0;

let lastFocusedSkinCard = null;
let savedScrollPosition = 0;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const swipeDistance = 45;


/* ==================================================
   Загрузка данных
   ================================================== */

fetch("data/brawlers.json")
    .then(response => {

        if (!response.ok) {
            throw new Error(
                `Ошибка загрузки JSON: ${response.status}`
            );
        }

        return response.json();

    })
    .then(brawlers => {

        const brawler = brawlers.find(
            item => item.name === name
        );

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
                    alt="${brawler.displayName}"
                    draggable="false">

                <h1 class="brawler-name">
                    ${brawler.displayName}
                </h1>


                <div class="info-card">

                    <p>

                        <strong>⭐ Редкость:</strong>

                        <span class="
                            rarity
                            ${brawler.rarityClass || ""}
                        ">
                            ${brawler.rarity || "Неизвестно"}
                        </span>

                    </p>


                    <p>

                        <strong>⚔️ Класс:</strong>

                        <span class="
                            class-tag
                            ${brawler.classClass || ""}
                        ">
                            ${brawler.class || "Неизвестно"}
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

                        ${titles.length
                            ? titles
                                .map(title => `

                                    <p class="${title.style || ""}">

                                        <strong>
                                            ${title.prime} Прайм:
                                        </strong>

                                        ${title.name}

                                    </p>

                                `)
                                .join("")
                            : "<p>Титулы пока не добавлены</p>"
                        }

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
   Маленькая карточка скина
   ================================================== */

function createSkinCard(skin, index) {

    const collection = skin.collection || {};
    const releaseYear = skin.releaseYear || "—";

    /*
       Дополнительная редкость имеет приоритет
       только в маленькой карточке.

       Например:
       Сверхредкий + Эксклюзивный

       Маленькая карточка:
       Эксклюзивный

       Полный просмотр:
       Сверхредкий
       Эксклюзивный
    */

    const cardRarity = skin.secondaryRarity
        ? {
            name:
                skin.secondaryRarity.name ||
                "Редкость неизвестна",

            class:
                skin.secondaryRarity.class ||
                "unknown"
        }
        : {
            name:
                skin.rarity ||
                "Редкость неизвестна",

            class:
                skin.rarityClass ||
                "unknown"
        };

    /*
       Свечение зависит от основной редкости,
       а не от дополнительной.
    */

    const glowClass =
        skin.rarityClass || "unknown";


    return `

        <article
            class="
                skin-card
                skin-glow-${glowClass}
            "
            data-skin-index="${index}"
            tabindex="0"
            role="button"
            aria-label="Открыть ${skin.displayName}">

            <div class="skin-image-box">

                <img
                    src="${skin.image}"
                    class="skin-image"
                    alt="${skin.displayName}"
                    loading="lazy"
                    draggable="false">

            </div>


            <div class="skin-card-content">

                <h3 class="skin-name">
                    ${skin.displayName}
                </h3>


                ${createCollectionMarkup(collection)}


                <div class="
                    skin-rarity
                    skin-rarity-${cardRarity.class}
                ">

                    ${cardRarity.name}

                </div>


                <div class="skin-card-footer">

                    <div class="skin-source">

                        ${createSourceMarkup(
                            skin,
                            false
                        )}

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
   Коллекция в маленькой карточке
   ================================================== */

function createCollectionMarkup(collection) {

    if (!collection || !collection.name) {
        return "";
    }

    const icon = collection.icon
        ? `
            <img
                src="${collection.icon}"
                class="collection-icon optional-icon"
                alt=""
                draggable="false">
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
   Цена и способ получения
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

    const sourceTextClass = viewer
        ? "viewer-source-text"
        : "source-text";


    /*
       В маленькой карточке используется shortName.

       В полном просмотре используется name.

       Например:

       Маленькая карточка:
       Brawl Pass

       Полный просмотр:
       Brawl Pass · 8-й сезон
    */

    const displayedSourceName = viewer
        ? source.name
        : source.shortName || source.name;


    if (source.type === "brawl_pass") {

        return createSpecialSourceMarkup(
            source.icon ||
                "assets/collections/brawl_pass.WEBP",

            displayedSourceName ||
                "Brawl Pass",

            viewer
        );

    }


    if (source.type === "pro_pass") {

        return createSpecialSourceMarkup(
            source.icon ||
                "assets/collections/pro_pass.WEBP",

            displayedSourceName ||
                "Pro Pass",

            viewer
        );

    }


    if (source.type === "free") {

        return `
            <span class="${sourceTextClass}">
                ${displayedSourceName || "Бесплатно"}
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
                        alt="Гемы"
                        draggable="false">

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
                        alt="Блинги"
                        draggable="false">

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
                        alt="Монеты"
                        draggable="false">

                    <span>
                        ${price.coins}
                    </span>

                </span>

            `);

        }


        if (!prices.length) {

            return `
                <span class="${sourceTextClass}">
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
        <span class="${sourceTextClass}">
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

    const containerClass = viewer
        ? "viewer-special-source"
        : "special-source";

    const iconClass = viewer
        ? "viewer-source-icon"
        : "source-icon";


    return `

        <div class="${containerClass}">

            <img
                src="${icon}"
                class="${iconClass} optional-icon"
                alt=""
                draggable="false">

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

    const skinsTab =
        document.getElementById("skinsTab");

    const infoTab =
        document.getElementById("infoTab");

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
   Нажатия на маленькие карточки
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

    const skins =
        Array.isArray(currentBrawler.skins)
            ? currentBrawler.skins
            : [];

    if (!skins[index]) {
        return;
    }


    currentSkinIndex = index;

    renderViewerSkin(currentSkinIndex);


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


    if (skinViewerClose) {
        skinViewerClose.focus();
    }

}


/* ==================================================
   Установка свечения внешней карточки
   ================================================== */

function setViewerCardGlow(rarityClass) {

    if (!skinViewer) {
        return;
    }

    const viewerCard =
        skinViewer.querySelector(
            ".skin-viewer-card"
        );

    if (!viewerCard) {
        return;
    }


    viewerCard.classList.remove(
        "viewer-card-glow-rare",
        "viewer-card-glow-superrare",
        "viewer-card-glow-epic",
        "viewer-card-glow-mythic",
        "viewer-card-glow-legendary",
        "viewer-card-glow-exclusive",
        "viewer-card-glow-unknown"
    );


    const allowedGlowClasses = [
        "rare",
        "superrare",
        "epic",
        "mythic",
        "legendary",
        "exclusive"
    ];


    const safeRarityClass =
        allowedGlowClasses.includes(rarityClass)
            ? rarityClass
            : "unknown";


    viewerCard.classList.add(
        `viewer-card-glow-${safeRarityClass}`
    );

}


/* ==================================================
   Полноэкранная карточка
   ================================================== */

function renderViewerSkin(index, direction = "") {

    if (
        !currentBrawler ||
        !skinViewerContent
    ) {
        return;
    }

    const skins =
        Array.isArray(currentBrawler.skins)
            ? currentBrawler.skins
            : [];

    const skin = skins[index];

    if (!skin) {
        return;
    }


    const collection =
        skin.collection || null;

    const secondaryCollection =
        skin.secondaryCollection || null;

    const secondaryRarity =
        skin.secondaryRarity || null;

    const previousDisabled =
        index === 0;

    const nextDisabled =
        index === skins.length - 1;

    const animationClass = direction
        ? `viewer-swipe-${direction}`
        : "";


    /*
       Свечение назначается внешней карточке,
       поэтому оно не прокручивается вместе
       с содержимым.
    */

    setViewerCardGlow(
        skin.rarityClass || "unknown"
    );


    skinViewerContent.innerHTML = `

        <div class="
            viewer-swipe-content
            ${animationClass}
        ">

            <div class="viewer-image-box">


                <button
                    type="button"
                    class="
                        viewer-navigation
                        viewer-navigation-left
                    "
                    data-viewer-action="previous"
                    aria-label="Предыдущий скин"
                    ${previousDisabled ? "disabled" : ""}>

                    ‹

                </button>


                <img
                    src="${skin.image}"
                    class="viewer-skin-image"
                    alt="${skin.displayName}"
                    draggable="false">


                <button
                    type="button"
                    class="
                        viewer-navigation
                        viewer-navigation-right
                    "
                    data-viewer-action="next"
                    aria-label="Следующий скин"
                    ${nextDisabled ? "disabled" : ""}>

                    ›

                </button>


            </div>


            <div class="viewer-information">


                <div class="viewer-title-row">

                    <h2
                        class="viewer-skin-name"
                        id="viewerSkinName">

                        ${skin.displayName}

                    </h2>


                    <span class="viewer-skin-counter">
                        ${index + 1} / ${skins.length}
                    </span>

                </div>


                <div class="viewer-info-group">

                    <div class="viewer-info-label">
                        Коллекции
                    </div>

                    <div class="viewer-collections">

                        ${createViewerCollectionMarkup(
                            collection
                        )}

                        ${createViewerCollectionMarkup(
                            secondaryCollection,
                            true
                        )}

                    </div>

                </div>


                <div class="viewer-info-group">

                    <div class="viewer-info-label">
                        Редкость
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

                </div>


                <div class="viewer-info-group">

                    <div class="viewer-info-label">
                        Получение
                    </div>

                    <div class="viewer-source">

                        ${createSourceMarkup(
                            skin,
                            true
                        )}

                    </div>

                </div>


                <div class="viewer-detail-section">

                    <div class="viewer-detail-label">
                        Дата выхода
                    </div>

                    <div class="viewer-release-date">

                        <strong>
                            ${formatReleaseDate(
                                skin.releaseDate
                            )}
                        </strong>

                    </div>

                </div>


                ${skin.description
                    ? `

                        <div class="viewer-detail-section">

                            <div class="viewer-detail-label">
                                Описание
                            </div>

                            <div class="viewer-description">

                                <p>
                                    ${skin.description}
                                </p>

                            </div>

                        </div>

                    `
                    : ""}

            </div>

        </div>

    `;


    hideBrokenOptionalIcons();

}


/* ==================================================
   Коллекции в просмотрщике
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
                class="
                    viewer-collection-icon
                    optional-icon
                "
                alt=""
                draggable="false">
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
        secondaryRarity.class ||
        "unknown";


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
   Переключение скинов
   ================================================== */

function changeViewerSkin(step) {

    if (!currentBrawler) {
        return;
    }

    const skins =
        Array.isArray(currentBrawler.skins)
            ? currentBrawler.skins
            : [];

    const newIndex =
        currentSkinIndex + step;


    if (
        newIndex < 0 ||
        newIndex >= skins.length
    ) {
        return;
    }


    currentSkinIndex = newIndex;


    renderViewerSkin(
        currentSkinIndex,
        step > 0 ? "right" : "left"
    );


    const viewerCard =
        skinViewer.querySelector(
            ".skin-viewer-card"
        );

    if (viewerCard) {
        viewerCard.scrollTop = 0;
    }

}


/* ==================================================
   Обработка свайпа
   ================================================== */

function handleViewerSwipe() {

    const differenceX =
        touchEndX - touchStartX;

    const differenceY =
        touchEndY - touchStartY;

    const horizontalDistance =
        Math.abs(differenceX);

    const verticalDistance =
        Math.abs(differenceY);


    if (
        horizontalDistance < swipeDistance ||
        horizontalDistance <= verticalDistance
    ) {
        return;
    }


    if (differenceX < 0) {

        changeViewerSkin(1);

    } else {

        changeViewerSkin(-1);

    }

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

    const parts =
        dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]) - 1;

    const day =
        Number(parts[2]);


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
   Нажатия на стрелки
   ================================================== */

if (skinViewerContent) {

    skinViewerContent.addEventListener(
        "click",
        event => {

            const navigationButton =
                event.target.closest(
                    "[data-viewer-action]"
                );


            if (!navigationButton) {
                return;
            }


            const action =
                navigationButton.dataset.viewerAction;


            if (action === "previous") {
                changeViewerSkin(-1);
            }


            if (action === "next") {
                changeViewerSkin(1);
            }

        }
    );

}


/* ==================================================
   Свайпы
   ================================================== */

if (skinViewerContent) {

    skinViewerContent.addEventListener(
        "touchstart",
        event => {

            if (event.touches.length !== 1) {
                return;
            }


            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

            touchEndX =
                touchStartX;

            touchEndY =
                touchStartY;

        },
        {
            passive:true
        }
    );


    skinViewerContent.addEventListener(
        "touchmove",
        event => {

            if (event.touches.length !== 1) {
                return;
            }


            touchEndX =
                event.touches[0].clientX;

            touchEndY =
                event.touches[0].clientY;

        },
        {
            passive:true
        }
    );


    skinViewerContent.addEventListener(
        "touchend",
        () => {

            handleViewerSwipe();

            touchStartX = 0;
            touchStartY = 0;
            touchEndX = 0;
            touchEndY = 0;

        }
    );

}


/* ==================================================
   Закрытие по кнопке и фону
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


/* ==================================================
   Управление клавиатурой
   ================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            !skinViewer ||
            !skinViewer.classList.contains("open")
        ) {
            return;
        }


        if (event.key === "Escape") {

            closeSkinViewer();

        }


        if (event.key === "ArrowLeft") {

            event.preventDefault();
            changeViewerSkin(-1);

        }


        if (event.key === "ArrowRight") {

            event.preventDefault();
            changeViewerSkin(1);

        }

    }
);


/* ==================================================
   Запрет прокрутки за просмотрщиком
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
        passive:false
    }
);


/* ==================================================
   Запрет меню сохранения, копирования
   и перетаскивания
   ================================================== */

document.addEventListener(
    "contextmenu",
    event => {

        if (
            event.target.closest(".skin-card") ||
            event.target.closest(".skin-viewer-card")
        ) {
            event.preventDefault();
        }

    }
);


document.addEventListener(
    "selectstart",
    event => {

        if (
            event.target.closest(".skin-card") ||
            event.target.closest(".skin-viewer-card")
        ) {
            event.preventDefault();
        }

    }
);


document.addEventListener(
    "dragstart",
    event => {

        if (
            event.target.closest(".skin-card") ||
            event.target.closest(".skin-viewer-card")
        ) {
            event.preventDefault();
        }

    }
);
 

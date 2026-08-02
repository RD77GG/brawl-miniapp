fetch("data/brawlers.json")
    .then(response => response.json())
    .then(brawlers => {
        const container = document.getElementById("fighters");

        brawlers.forEach(brawler => {
            const card = document.createElement("div");

            card.innerHTML = `
                <h2>${brawler.name}</h2>
                <p>Скинов: ${brawler.skins.length}</p>
            `;

            container.appendChild(card);
        });
    })
    .catch(error => {
        console.log("Ошибка:", error);
    });

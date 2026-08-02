fetch("data/brawlers.json")
  .then(response => response.json())
  .then(brawlers => {

    const fighters = document.getElementById("fighters");

    brawlers.forEach(brawler => {

      const card = document.createElement("div");
      card.className = "fighter-card";

      card.innerHTML = `
        <h2>${brawler.name}</h2>
        <p>Скинов: ${brawler.skins.length}</p>
      `;

      fighters.appendChild(card);

    });

  })
  .catch(error => {
    console.log("Ошибка загрузки данных:", error);
  });

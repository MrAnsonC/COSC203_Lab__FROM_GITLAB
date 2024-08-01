document.addEventListener('DOMContentLoaded', () => {
    let birds = [];
    let currentPage = 1;
    let translations = {};

    fetch('data/nzbird.json')
        .then(response => response.json())
        .then(birdData => {
            birds = shuffleArray(birdData); // Randomize birds
            displaybirds(birds, currentPage);
        })
        .catch(error => console.error('Error loading bird data:', error));

    document.getElementById('filterResults').addEventListener('click', () => {
        const searchValue = document.getElementById('search').value.toLowerCase();
        const stateValue = document.getElementById('state').value;

        let filteredbirds = birds.filter(bird => {
            const matchesSearch = bird.common_name.toLowerCase().includes(searchValue) || searchValue === "";
            const matchesState = stateValue === "All" || bird.status === stateValue;
            return matchesSearch && matchesState;
        });

        console.log('Filtered birds:', filteredbirds); // Debugging log
        displaybirds(filteredbirds, currentPage); // Display filtered birds
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('state').value = 'All';
        displaybirds(birds, currentPage); // Display all birds after reset
    });

    const hamburger = document.getElementById('hamburger');
    const filter = document.getElementById('filter');
    const closeBtn = document.getElementById('closeBtn');
    const languageSelect = document.getElementById('language');

    hamburger.addEventListener('click', () => {
        filter.style.transform = 'translateX(0)';
    });

    closeBtn.addEventListener('click', () => {
        filter.style.transform = 'translateX(-100%)';
    });

    // Load the saved language from local storage
    const savedLanguage = localStorage.getItem('language') || 'English';
    languageSelect.value = savedLanguage;
    loadTranslations(savedLanguage);

    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        localStorage.setItem('language', selectedLanguage);
        loadTranslations(selectedLanguage);
    });

    function loadTranslations(language) {
        fetch('data/index_language.json')
            .then(response => response.json())
            .then(data => {
                translations = data[language];
                applyTranslations(translations);
                displaybirds(birds, currentPage); // Re-display birds with new translations
            })
            .catch(error => console.error('Error loading language file:', error));
    }

    function applyTranslations(translations) {
        document.getElementById('page-title').textContent = translations.title;
        document.getElementById('main-title').textContent = translations.title;
        document.getElementById('find-birds-title').textContent = translations.findBirds;
        document.getElementById('search-label').textContent = translations.searchLabel;
        document.getElementById('search').placeholder = translations.searchPlaceholder;
        document.getElementById('status-label').textContent = translations.statusLabel;
    
        const statusOptions = document.getElementById('state').options;
        statusOptions[0].textContent = translations.all;
        statusOptions[1].textContent = translations.notThreatened;
        statusOptions[2].textContent = translations.naturallyUncommon;
        statusOptions[3].textContent = translations.relict;
        statusOptions[4].textContent = translations.recovering;
        statusOptions[5].textContent = translations.declining;
        statusOptions[6].textContent = translations.nationallyIncreasing;
        statusOptions[7].textContent = translations.nationallyVulnerable;
        statusOptions[8].textContent = translations.nationallyEndangered;
        statusOptions[9].textContent = translations.nationallyCritical;
        statusOptions[10].textContent = translations.extinct;
        statusOptions[11].textContent = translations.dataDeficient;

        document.getElementById('filterResults').textContent = translations.findBirdsButton;
        document.getElementById('resetFilters').textContent = translations.resetFiltersButton;
        document.getElementById('language-label').textContent = translations.languageLabel;
        document.getElementById('footer-text').innerHTML = translations.footerText;
    }

    function displaybirds(birds) {
        const birdCardsContainer = document.getElementById('bird_card');
        birdCardsContainer.innerHTML = '';

        birds.forEach(bird => {
            const card = document.createElement('div');
            card.classList.add('bird-card');

            const image = bird.photo ? bird.photo.source : 'data/images/unknown.jpg';
            const common_name = bird.common_name || 'unknown';
            const scientific_name = bird.scientific_name || 'unknown';
            const family = bird.family || 'unknown';
            const order = bird.order || 'unknown';
            const status = bird.status || 'unknown';
            const length = bird.length || 'unknown';
            const weight = bird.weight || 'unknown';

            card.innerHTML = `
                <div class="bird-image-container">
                    <img src="${image}" alt="${common_name}">
                </div>
                <div class="bird-info">
                    <h1>${common_name}</h1>
                    <div>
                    
                        <strong class="label">${translations.scientificName}: </strong><strong class="value">${scientific_name}</strong>
                    </div>
                    <div>
                        <strong class="label">${translations.family}: </strong><strong class="value">${family}</strong>
                    </div>
                    <div>
                        <strong class="label">${translations.order}: </strong><strong class="value">${order}</strong>
                    </div>
                    <div>
                        <strong class="label">${translations.status}: </strong><strong class="value">${status}</strong>
                    </div>
                    <div>
                        <strong class="label">${translations.length}: </strong><strong class="value">${length}</strong>
                    </div>
                    <div>
                        <strong class="label">${translations.weight}: </strong><strong class="value">${weight}</strong>
                    </div>
                </div>
            `;

            birdCardsContainer.appendChild(card);
        });
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});

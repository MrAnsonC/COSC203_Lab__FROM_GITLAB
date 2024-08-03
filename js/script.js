document.addEventListener('DOMContentLoaded', () => {
    let birds = [];
    let currentPage = 1;
    let translations = {};
    let resultCount = 0;

    fetch('data/nzbird.json')
        .then(response => response.json())
        .then(birdData => {
            birds = shuffleArray(birdData); 
            displaybirds(birds, currentPage);
            updateResultsCount(birds.length);
        })
        .catch(error => console.error('Error loading bird data:', error));

    document.getElementById('filterResults').addEventListener('click', () => {
        const searchValue = document.getElementById('search').value.toLowerCase();
        const stateValue = document.getElementById('status').value;
        const weightSortValue = document.getElementById('weight').value;

        let filteredbirds = birds.filter(bird => {
            const searchLower = searchValue.toLowerCase();

            const matchesSearch = bird.common_name.toLowerCase().includes(searchLower) || 
                bird.original_name.toLowerCase().includes(searchLower) || 
                bird.scientific_name.toLowerCase().includes(searchLower) || 
                bird.other_name.some(name => name.toLowerCase().includes(searchLower)) || 
                bird.order.toLowerCase().includes(searchLower) || 
                bird.family.toLowerCase().includes(searchLower) || 
                searchLower === "";
            
            const matchesState = stateValue === "All" || bird.status === stateValue;
            return matchesSearch && matchesState;
        });

        // Sort birds by weight
        filteredbirds.sort((a, b) => {
            const weightA = parseWeight(a.weight);
            const weightB = parseWeight(b.weight);

            if (weightSortValue === 'ligh_to_heav') {
                return weightA - weightB;
            } else {
                return weightB - weightA;
            }
        });

        displaybirds(filteredbirds, currentPage);
        updateResultsCount(filteredbirds.length);
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('status').value = 'All';
        document.getElementById('weight').value = 'ligh_to_heav'; 
        displaybirds(birds, currentPage); 
    });

    function updateResultsCount(count) {
        const resultsCountElement = document.getElementById('resultsCount');
        let resultsText;
        if (count === 0) {
            resultsText = translations.resultsCount;
        } else {
            resultsText = translations.resultsCountPlural.replace("{count}", count);
        }
        resultsCountElement.textContent = resultsText;
    }

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
        document.getElementById('closeBtn').textContent = translations.close;
        document.getElementById('main-title').textContent = translations.title;
        document.getElementById('find-birds-title').textContent = translations.findBirds;
        document.getElementById('search-label').textContent = translations.searchLabel;
        document.getElementById('search').placeholder = translations.searchPlaceholder;
        document.getElementById('status-label').textContent = translations.statusLabel;
        document.getElementById('weight-label').textContent = translations.weightLabel;
        document.getElementById('conservation-status-title').textContent = translations.conservationStatus;

        //state
        document.getElementById('not_threatened').textContent = translations.notThreatened;
        document.getElementById('naturally_uncommon').textContent = translations.naturallyUncommon;
        document.getElementById('relict').textContent = translations.relict;
        document.getElementById('recovering').textContent = translations.recovering;
        document.getElementById('declining').textContent = translations.declining;
        document.getElementById('nationally_increasing').textContent = translations.nationallyIncreasing;
        document.getElementById('nationally_vulnerable').textContent = translations.nationallyVulnerable;
        document.getElementById('nationally_endangered').textContent = translations.nationallyEndangered;
        document.getElementById('nationally_critical').textContent = translations.nationallyCritical;
        document.getElementById('extinct').textContent = translations.extinct;
        document.getElementById('data_deficient').textContent = translations.dataDeficient;
    
        const statusOptions = document.getElementById('status').options;
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

        const weightOptions = document.getElementById('weight').options;
        weightOptions[0].textContent = translations.ligh_to_heav;
        weightOptions[1].textContent = translations.heav_to_ligh;
        
        document.getElementById('filterResults').textContent = translations.findBirdsButton;
        document.getElementById('resetFilters').textContent = translations.resetFiltersButton;
        document.getElementById('resultsCount').textContent = translations.resultsCount;
        document.getElementById('language-label').textContent = translations.languageLabel;
        document.getElementById('aside-text').innerHTML = translations.asideText;
        document.getElementById('footer-text').innerHTML = translations.footerText;

        updateResultsCount(resultCount);
    }

    function parseWeight(weightStr) {
        if (!weightStr) return 0; 
    
        const matches = weightStr.match(/(\d+\.?\d*)\s*(g|kg)?/gi);
        if (matches) {
            const weightsInGrams = matches.map(match => {
                const [, value, unit] = match.match(/(\d+\.?\d*)\s*(g|kg)?/i);
                const weight = parseFloat(value);
                return unit && unit.toLowerCase() === 'kg' ? weight * 1000 : weight;
            });
    
            return Math.max(...weightsInGrams); 
        }
        return 0; 
    }

    function displaybirds(birds) {
        const birdCardsContainer = document.getElementById('bird_card');
        birdCardsContainer.innerHTML = '';

        birds.forEach(bird => {
            const card = document.createElement('div');
            card.classList.add('bird-card');

            const statusClass = `status-${bird.status.toLowerCase().replace(/\s+/g, '-')}`;
            card.classList.add(statusClass);

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

let nameData = [];

async function fetchNamesFromCSV() {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWtpAQv5a6V68hm9dw2kBPj77rmwWegNDoTG_tDCE8iJMOE1mrs1wX_3KxOte9UgW1RQuaKp5ayez_/pub?gid=0&single=true&output=csv";
    
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        
        const rows = csvText.split('\n').slice(1);  // Skip the header
        
        rows.forEach((row, index) => {
            const cols = row.split(',');

            if (cols[1] && cols[2]) {
                nameData.push({
                    name: cols[1].trim(),
                    category: cols[2].trim(),
                    additionalInfo: {
                        namaPenuh: cols[3] || '',
                        namaLatin: cols[5] || '', 
                        tabaqah: cols[6] || '',
                        yahya_opinion: cols[7] || '',
                        yahya_source: cols[8] || '',
                        hanbal_opinion: cols[10] || '',
                        hanbal_source: cols[11] || '',
                        bukhari_opinion: cols[13] || '',
                        bukhari_source: cols[14] || '',
                        abuZurah_opinion: cols[16] || '',
                        abuZurah_source: cols[17] || '',
                        abuHatim_opinion: cols[19] || '',
                        abuHatim_source: cols[20] || '',
                        nasai_opinion: cols[22] || '',
                        nasai_source: cols[23] || '',
                        uqayli_opinion: cols[25] || '',
                        uqayli_source: cols[26] || '',
                        ibnHibban_opinion: cols[28] || '',
                        ibnHibban_source: cols[29] || '',
                        ibnAdi_opinion: cols[31] || '',
                        ibnAdi_source: cols[32] || '',
                        daruqutni_opinion: cols[34] || '',
                        daruqutni_source: cols[35] || '',
                        ibnHajar_opinion: cols[37] || '',
                        ibnHajar_source: cols[38] || '',
                        tahrir_opinion: cols[40] || '',
                        tahrir_source: cols[41] || ''
                    }
                });
            } else {
                console.warn(`Skipped row ${index + 1} due to missing data in column B or C`);
            }
        });
        
        console.log('Data loaded from CSV:', nameData);
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        alert('Unable to fetch data. Please check the URL.');
    }
}

function addParagraph() {
    const container = document.getElementById('paragraphContainer');
    const wrapper = document.createElement('div');
    wrapper.className = 'paragraph-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '10px';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'paragraph';
    textarea.placeholder = 'Tulis atau tampal sanad anda di sini...';
    wrapper.appendChild(textarea);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Buang';
    removeButton.className = 'remove-button';
    removeButton.onclick = function() {
        container.removeChild(wrapper);
    };
    wrapper.appendChild(removeButton);

    container.insertBefore(wrapper, container.firstChild); // Prepend the new paragraph
}

function clearText() {
    const textareas = document.querySelectorAll('.paragraph');
    textareas.forEach(textarea => {
        textarea.value = '';
    });

    const combinedNamesContainer = document.getElementById('combinedNamesContainer');
    combinedNamesContainer.innerHTML = '<h2>Rajah Sanad</h2><div class="instruction">Klik di atas nama perawi</div>';
}

async function generate() {
    await fetchNamesFromCSV();

    const paragraphs = document.querySelectorAll('.paragraph-wrapper');
    const combinedNamesContainer = document.getElementById('combinedNamesContainer');
    const positionMap = {};

    combinedNamesContainer.innerHTML = '<h2>Rajah Sanad</h2>';

    paragraphs.forEach(wrapper => {
        const paragraph = wrapper.querySelector('.paragraph').value;
        const processedParagraph = processParagraph(paragraph, positionMap);
        wrapper.querySelector('.paragraph').innerHTML = processedParagraph;
    });

    Object.keys(positionMap).forEach(position => {
        const combinedRow = document.createElement('div');
        combinedRow.className = 'combined-row';
        positionMap[position].forEach(name => {
            const box = document.createElement('div');
            const entry = nameData.find(n => n.name === name);

            box.className = 'box';
            box.textContent = name;

            if (entry) {
                if (entry.category === 'ثقة') {
                    box.classList.add('green');
                } else if (entry.category === 'صدوق') {
                    box.classList.add('blue');
                } else if (entry.category === 'ضعيف محتمل') {
                    box.classList.add('yellow');
                } else if (entry.category === 'ضعيف') {
                    box.classList.add('orange');
                } else if (entry.category === 'شديد الضعف') {
                    box.classList.add('chocolate');
                } else if (entry.category === 'واه' || entry.category === 'واهي') {
                    box.classList.add('red');
                }

                box.addEventListener('click', () => {
                    showModal(entry);
                });
            }

            combinedRow.appendChild(box);
        });
        combinedNamesContainer.appendChild(combinedRow);
    });
}

function processParagraph(paragraph, positionMap) {
    const excludeWords = ["عن", "حدثنا", "ثنا", "أخبرنا", "حدثني", "أخبرني" ,"قال" ,"أخبره" ,"أنه" ,"سمع" ,"نا" ,"وحدثني" ,"يقول:" , "سمعت", "وحدثنا", "أنبأنا", "ثني", "قال:", "أن"]; 
    const nameMatches = [];
    
    const cleanedParagraph = paragraph.replace(/[،,]/g, '');

    const combinedRegex = /عبد\s\S+\sبن\sأبي\s\S+|أبو\s\S+\sبن\sأبي\s\S+|أبو\s\S+\sبن\s\S+|S+\sبن\sأبي\s\S+|عبد\s\S+\sبن\s\S+|أبا\s\S+|أبي\s\S+|أبو\s\S+|ابن\s\S+|أبي\s\S+|\S+\sبن\s\S+|\S+\sيعني\s\S+\s\S+|\S+\sبن\sأبي\s\S+|\S+\sبن\sالله|\S+\sالله/g;
    let match;

    while ((match = combinedRegex.exec(cleanedParagraph)) !== null) {
        const nameGroup = match[0];
        nameMatches.push({ name: nameGroup, index: match.index });
    }

    const words = cleanedParagraph.replace(combinedRegex, '').split(/\s+/);
    words.forEach((word, index) => {
        if (word && !excludeWords.includes(word)) {
            const wordIndex = paragraph.indexOf(word, index);
            nameMatches.push({ name: word, index: wordIndex });
        }
    });

    nameMatches.sort((a, b) => a.index - b.index);

    nameMatches.reverse().forEach((match, i) => {
        const position = i;
        if (!positionMap[position]) {
            positionMap[position] = [];
        }
        if (!positionMap[position].includes(match.name)) {
            positionMap[position].push(match.name);
        }
    });

    let processedParagraph = paragraph;
    nameMatches.forEach(match => {
        const entry = nameData.find(n => n.name === match.name);
        if (entry) {
            let colorClass = '';
            if (entry.category === 'ثقة') {
                colorClass = 'green';
            } else if (entry.category === 'صدوق') {
                colorClass = 'blue';
            } else if (entry.category === 'ضعيف محتمل') {
                colorClass = 'yellow';
            } else if (entry.category === 'ضعيف') {
                colorClass = 'orange';
            } else if (entry.category === 'شديد الضعف') {
                colorClass = 'chocolate';
            } else if (entry.category === 'واه' || entry.category === 'واهي') {
                colorClass = 'red';
            }

            processedParagraph = processedParagraph.replace(
                match.name,
                `<span class="highlight ${colorClass}">${match.name}</span>`
            );
        }
    });

    return processedParagraph;
}

function showModal(entry) {
    const modal = document.getElementById('myModal');
    const closeBtn = document.querySelector('.close');
    document.getElementById('scholarName').textContent = `Komentar ulama tentang ${entry.name}`;
    document.getElementById('scholarOpinion').innerHTML = `
        <strong>Nama Penuh:</strong> ${entry.additionalInfo.namaPenuh} <br>
        <strong>Nama Latin:</strong> ${entry.additionalInfo.namaLatin} <br>
        <strong>Tabaqah:</strong> ${entry.additionalInfo.tabaqah} <br>
        <strong>Yahya ibn Ma'in (198H):</strong> ${entry.additionalInfo.yahya_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.yahya_source}<br><br>
        <strong>Ahmad ibn Hanbal (241H):</strong> ${entry.additionalInfo.hanbal_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.hanbal_source}<br><br>
        <strong>Al-Bukhari (256H):</strong> ${entry.additionalInfo.bukhari_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.bukhari_source}<br><br>
        <strong>Abu Zur'ah (264H):</strong> ${entry.additionalInfo.abuZurah_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.abuZurah_source}<br><br>
        <strong>Abu Hatim (277H):</strong> ${entry.additionalInfo.abuHatim_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.abuHatim_source}<br><br>
        <strong>Al-Nasa'i (303H):</strong> ${entry.additionalInfo.nasai_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.nasai_source}<br><br>
        <strong>Al-Uqayli (322H):</strong> ${entry.additionalInfo.uqayli_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.uqayli_source}<br><br>
        <strong>Ibn Hibban (354H):</strong> ${entry.additionalInfo.ibnHibban_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.ibnHibban_source}<br><br>
        <strong>Ibn Adi (365H):</strong> ${entry.additionalInfo.ibnAdi_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.ibnAdi_source}<br><br>
        <strong>Al-Daraqutni (385H):</strong> ${entry.additionalInfo.daruqutni_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.daruqutni_source}<br><br>
        <strong>Ibn Hajar (852H):</strong> ${entry.additionalInfo.ibnHajar_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.ibnHajar_source}<br><br>
        <strong>Tahrir:</strong> ${entry.additionalInfo.tahrir_opinion} <br>
        <strong>Sumber:</strong> ${entry.additionalInfo.tahrir_source}
    `;

    modal.style.display = "block";

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
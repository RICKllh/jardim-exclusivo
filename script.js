// --- CONTADOR DE TEMPO JUNTOS ---
function updateCounter() {
    const startDate = new Date("2025-06-23T00:00:00");
    const now = new Date();
    const diffTime = Math.abs(now - startDate);

    const totalSeconds = Math.floor(diffTime / 1000);
    const totalHours = Math.floor(totalSeconds / 3600);
    const totalDays = Math.floor(totalHours / 24);
    
    let months = (now.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += now.getMonth();
    if (now.getDate() < startDate.getDate()) {
        months--;
    }
    if (months < 0) months = 0;

    document.getElementById('meses').innerText = months;
    document.getElementById('dias').innerText = totalDays;
    document.getElementById('horas').innerText = totalHours;
    document.getElementById('segundos').innerText = totalSeconds;
}

setInterval(updateCounter, 1000);
updateCounter();

// --- CONTROLE DA MÚSICA ---
// --- CONTROLE DA MÚSICA ATUALIZADO ---
const music = document.getElementById('bgMusic');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const volumeBar = document.getElementById('volumeBar');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        music.pause();
        playBtn.innerHTML = "▶";
    } else {
        music.play();
        playBtn.innerHTML = "⏸";
    }
    isPlaying = !isPlaying;
}

// Atualiza a barra de progresso e o cronômetro conforme a música toca
music.addEventListener('timeupdate', () => {
    if (!isNaN(music.duration)) {
        const progressPercent = (music.currentTime / music.duration) * 100;
        progressBar.value = progressPercent;
        currentTimeEl.textContent = formatTime(music.currentTime);
        durationTimeEl.textContent = formatTime(music.duration);
    }
});

// Permite alterar o tempo da música clicando/arrastando a barra
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * music.duration;
    music.currentTime = seekTime;
});

// Controle de Volume: aumenta e diminui o som
volumeBar.addEventListener('input', () => {
    music.volume = volumeBar.value;
});

// Formata o tempo para o padrão de Minutos:Segundos (ex: 1:05)
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Quando a música carregar os dados invisíveis, mostra a duração total na tela
music.addEventListener('loadedmetadata', () => {
    durationTimeEl.textContent = formatTime(music.duration);
});

// --- SISTEMA DE NOTAS ---
let currentAuthor = 'Rick'; // Define Rick como padrão ao abrir a página
let savedNotes = JSON.parse(localStorage.getItem('nossasNotas')) || [];

// Função para alternar entre Rick e Iza
function selectAuthor(author) {
    currentAuthor = author;
    
    // Remove a classe 'active' de ambos os botões
    document.getElementById('btn-rick').classList.remove('active');
    document.getElementById('btn-iza').classList.remove('active');
    
    // Adiciona a classe 'active' no botão clicado
    if (author === 'Rick') {
        document.getElementById('btn-rick').classList.add('active');
    } else {
        document.getElementById('btn-iza').classList.add('active');
    }
}

// Função para adicionar uma nova nota
function addNote() {
    const input = document.getElementById('noteInput');
    const text = input.value.trim();
    
    // Se o texto estiver vazio, não faz nada
    if (text === '') return;

    // Pega a data atual formatada (Ex: 03/04/2026)
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR');

    const newNote = {
        id: Date.now(), // Gera um ID único baseado na hora
        author: currentAuthor,
        text: text,
        date: formattedDate
    };

    savedNotes.unshift(newNote); // Coloca a nota mais recente no topo
    localStorage.setItem('nossasNotas', JSON.stringify(savedNotes)); // Salva
    
    input.value = ''; // Limpa o campo de texto
    renderNotes(); // Atualiza a tela
}

// Função para apagar uma nota indesejada
function deleteNote(id) {
    savedNotes = savedNotes.filter(note => note.id !== id);
    localStorage.setItem('nossasNotas', JSON.stringify(savedNotes));
    renderNotes();
}

// Função que desenha as notas na tela
function renderNotes() {
    const container = document.getElementById('notesContainer');
    container.innerHTML = ''; // Limpa tudo antes de desenhar

    savedNotes.forEach(note => {
        // Define o emoji baseado no autor salvo
        const authorIcon = note.author === 'Rick' ? '🧡' : '🌸';
        
        container.innerHTML += `
            <div class="note-item">
                <div class="note-header">
                    <span>${note.author} ${authorIcon}</span>
                    <span class="note-date">${note.date}</span>
                </div>
                <p class="note-text">${note.text}</p>
                <button class="btn-delete-note" onclick="deleteNote(${note.id})">Apagar</button>
            </div>
        `;
    });
}

// Carrega as notas salvas assim que o site abrir
renderNotes();

async function searchMoviesAPI() {
    const query = document.getElementById('movieSearch').value;
    if(!query) return;

    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<p style="font-size: 0.8rem;">Buscando...</p>';

    try {
        // Busca na API pública e rápida do iTunes
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=movie&limit=3`);
        const data = await response.json();
        
        resultsDiv.innerHTML = '';
        if(data.results.length === 0) {
            resultsDiv.innerHTML = '<p style="font-size: 0.8rem;">Nenhum filme encontrado.</p>';
            return;
        }

        data.results.forEach(movie => {
            const highResImage = movie.artworkUrl100.replace('100x100bb', '400x400bb');
            
            resultsDiv.innerHTML += `
                <div class="search-item" onclick="addMovie('${movie.trackName.replace(/'/g, "\\'")}', '${highResImage}')">
                    <img src="${highResImage}" alt="${movie.trackName}">
                    <small>${movie.trackName}</small><br>
                    <small style="color:#d84315; font-weight:bold;">+ Adicionar</small>
                </div>
            `;
        });
    } catch (error) {
        resultsDiv.innerHTML = '<p style="font-size: 0.8rem;">Erro ao buscar filme.</p>';
    }
}

function addMovie(title, image) {
    savedMovies.push({ title, image });
    localStorage.setItem('nossoMundoFilmes', JSON.stringify(savedMovies));
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('movieSearch').value = '';
    renderSavedMovies();
}

function removeMovie(index) {
    savedMovies.splice(index, 1);
    localStorage.setItem('nossoMundoFilmes', JSON.stringify(savedMovies));
    renderSavedMovies();
}

// Renderiza a lista de filmes quando o site abre
renderSavedMovies();
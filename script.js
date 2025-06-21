document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const competition = params.get('comp');
    const model = '120min'; // Modelo fixo em 120min

    const gameBody = document.getElementById('game-body');
    if (competition) {
        gameBody.className = '';
        gameBody.classList.add(`comp-${competition}`);
    }

    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const additionTimeInput = document.getElementById('addition-time');
    const additionInputWrapper = document.querySelector('.addition-input-wrapper');
    const plusSign = document.querySelector('.plus-sign'); // NOVO: Seleciona o elemento do sinal de mais

    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const halfTimeBtn = document.getElementById('half-time-btn'); // Encerrar 1º Tempo
    const startSecondHalfBtn = document.getElementById('start-second-half-btn');
    const endSecondHalfBtn = document.getElementById('end-second-half-btn'); // Encerrar 2º Tempo
    const endMatchBtn = document.getElementById('end-match-btn');
    const startExtraTimeBtn = document.getElementById('start-extra-time-btn');
    const endExtraTimeBtn = document.getElementById('end-extra-time-btn');
    const backToModelBtn = document.getElementById('back-to-model');

    let timer;
    let elapsedSeconds = 0; // AGORA: Representa o tempo EXATO a ser exibido no display
    let isRunning = false;
    let currentHalf = 0; // 0: Não iniciado, 1: 1º Tempo, 2: 2º Tempo, 3: 1ª Prorrogação, 4: 2ª Prorrogação
    let additionTime = 0; // Acréscimos digitados pelo usuário (em segundos) - usados para o período ATUAL

    const timeModels = {
        '90min': { halfDuration: 45 * 60, hasExtraTime: false },
        '120min': { halfDuration: 45 * 60, hasExtraTime: true, extraTimeDuration: 15 * 60 },
        '40min': { halfDuration: 20 * 60, hasExtraTime: false }
    };
    const selectedModel = timeModels[model];

    function updateDisplay() {
        let mins = Math.floor(elapsedSeconds / 60);
        let secs = elapsedSeconds % 60;

        minutesDisplay.textContent = String(mins).padStart(2, '0');
        secondsDisplay.textContent = String(secs).padStart(2, '0');

        checkAdditionTimeVisibility();
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        timer = setInterval(() => {
            elapsedSeconds++; // Simplesmente incrementa o tempo exibido
            updateDisplay();
        }, 1000);
        updateButtonVisibility('start');
    }

    function pauseTimer() {
        if (!isRunning) return;
        clearInterval(timer);
        isRunning = false;
        updateButtonVisibility('pause');
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        elapsedSeconds = 0;
        currentHalf = 0;
        additionTime = 0;
        additionTimeInput.value = 0;
        updateDisplay();
        updateButtonVisibility('reset');
    }

    function handleEndOfHalf(nextState) {
        clearInterval(timer);
        isRunning = false;

        additionTimeInput.value = 0; // Limpa o input para o próximo período
        additionTime = 0; // Zera a variável interna de acréscimos

        updateButtonVisibility(nextState);
    }

    updateButtonVisibility.lastState = 'initial';

    function updateButtonVisibility(state) {
        updateButtonVisibility.lastState = state;

        startBtn.classList.add('hidden');
        pauseBtn.classList.add('hidden');
        resetBtn.classList.add('hidden');
        halfTimeBtn.classList.add('hidden');
        startSecondHalfBtn.classList.add('hidden');
        endSecondHalfBtn.classList.add('hidden');
        endMatchBtn.classList.add('hidden');
        startExtraTimeBtn.classList.add('hidden');
        endExtraTimeBtn.classList.add('hidden');

        additionTimeInput.disabled = false;

        switch (state) {
            case 'initial':
                startBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');
                additionTimeInput.value = 0;
                break;
            case 'start':
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');

                if (currentHalf === 1) halfTimeBtn.classList.remove('hidden');
                if (currentHalf === 2) endSecondHalfBtn.classList.remove('hidden');
                if (currentHalf === 3) endExtraTimeBtn.classList.remove('hidden'); // Encerrar 1ª Prorrogação
                if (currentHalf === 4) endMatchBtn.classList.remove('hidden'); // Encerrar 2ª Prorrogação / Partida
                break;
            case 'pause':
                startBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');

                if (currentHalf === 1) halfTimeBtn.classList.remove('hidden');
                if (currentHalf === 2) endSecondHalfBtn.classList.remove('hidden');
                if (currentHalf === 3) endExtraTimeBtn.classList.remove('hidden');
                if (currentHalf === 4) endMatchBtn.classList.remove('hidden');
                break;
            case 'reset':
                startBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');
                currentHalf = 0;
                additionTimeInput.value = 0;
                startExtraTimeBtn.textContent = 'Iniciar Prorrogação';
                break;

            case 'readyForSecondHalf':
                startSecondHalfBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');
                break;
            case 'readyForExtraTime':
                startExtraTimeBtn.classList.remove('hidden');
                startExtraTimeBtn.textContent = 'Iniciar Prorrogação';
                resetBtn.classList.remove('hidden');
                break;
            case 'readyForExtraTime2':
                startExtraTimeBtn.classList.remove('hidden');
                startExtraTimeBtn.textContent = 'Iniciar 2º Prorrogação';
                resetBtn.classList.remove('hidden');
                break;
            case 'matchEnded':
                endMatchBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');
                additionTimeInput.disabled = true;
                break;
        }
        checkAdditionTimeVisibility();
    }

    function checkAdditionTimeVisibility() {
        let shouldShow = false;
        const baseHalfDuration = selectedModel.halfDuration;
        const baseExtraTimeDuration = selectedModel.extraTimeDuration || 0;

        // A visibilidade dos acréscimos agora depende diretamente de elapsedSeconds
        // para os limites nominais de cada tempo.
        switch (currentHalf) {
            case 1: // 1º Tempo: Acréscimos aparecem a partir de 45:00
                if (elapsedSeconds >= baseHalfDuration) {
                    shouldShow = true;
                }
                break;
            case 2: // 2º Tempo: Acréscimos aparecem a partir de 90:00
                if (elapsedSeconds >= (baseHalfDuration * 2)) {
                    shouldShow = true;
                }
                break;
            case 3: // 1ª Prorrogação: Acréscimos aparecem a partir de 105:00
                if (elapsedSeconds >= (baseHalfDuration * 2) + baseExtraTimeDuration) {
                    shouldShow = true;
                }
                break;
            case 4: // 2ª Prorrogação: Acréscimos aparecem a partir de 120:00
                if (elapsedSeconds >= (baseHalfDuration * 2) + (baseExtraTimeDuration * 2)) {
                    shouldShow = true;
                }
                break;
            default:
                shouldShow = false;
                break;
        }

        if (updateButtonVisibility.lastState === 'matchEnded' || currentHalf === 0) {
            shouldShow = false;
        }

        if (shouldShow) {
            additionInputWrapper.classList.remove('hidden');
            plusSign.classList.remove('hidden'); // NOVO: Mostra o sinal de mais
        } else {
            additionInputWrapper.classList.add('hidden');
            plusSign.classList.add('hidden'); // NOVO: Esconde o sinal de mais
        }
    }

    // --- Event Listeners dos Botões ---

    startBtn.addEventListener('click', () => {
        if (currentHalf === 0) {
            elapsedSeconds = 0; // Começa do zero para o 1º tempo
            currentHalf = 1;
        }
        startTimer();
    });

    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Botão "Encerrar 1º Tempo"
    halfTimeBtn.addEventListener('click', () => {
        // Captura os acréscimos digitados para o 1º tempo
        additionTime = parseInt(additionTimeInput.value) || 0;
        
        // Garante que o relógio exiba pelo menos o tempo nominal + acréscimos do 1º tempo
        const expectedEndTimeForDisplay = selectedModel.halfDuration + additionTime;
        if (elapsedSeconds < expectedEndTimeForDisplay) {
            elapsedSeconds = expectedEndTimeForDisplay;
        }
        updateDisplay();
        currentHalf = 1; // Permanece no estado do 1º tempo para transição
        handleEndOfHalf('readyForSecondHalf');
    });

    // NOVO: Iniciar Segundo Tempo
    startSecondHalfBtn.addEventListener('click', () => {
        // NÃO se importa com os acréscimos do tempo anterior aqui.
        // Apenas define elapsedSeconds para o início nominal do 2º tempo (45:00)
        elapsedSeconds = selectedModel.halfDuration; // 45 minutos
        currentHalf = 2;
        startTimer();
    });

    // Event Listener para o botão "Encerrar 2º Tempo"
    endSecondHalfBtn.addEventListener('click', () => {
        // Captura os acréscimos digitados para o 2º tempo
        additionTime = parseInt(additionTimeInput.value) || 0;
        
        // Garante que o relógio exiba pelo menos o tempo nominal + acréscimos do 2º tempo
        const expectedEndTimeForDisplay = (selectedModel.halfDuration * 2) + additionTime;
        if (elapsedSeconds < expectedEndTimeForDisplay) {
            elapsedSeconds = expectedEndTimeForDisplay;
        }
        updateDisplay();
        currentHalf = 2; // Permanece no estado do 2º tempo para transição

        if (selectedModel.hasExtraTime) {
            handleEndOfHalf('readyForExtraTime'); // Vai para a tela de iniciar 1ª prorrogação
        } else {
            handleEndOfHalf('matchEnded'); // Finaliza a partida se não houver prorrogação
        }
    });

    // NOVO: Iniciar Prorrogação (1ª ou 2ª)
    startExtraTimeBtn.addEventListener('click', () => {
        // Define elapsedSeconds para o início nominal da prorrogação.
        additionTime = parseInt(additionTimeInput.value) || 0; // Acréscimos do período ANTERIOR

        if (currentHalf === 2) { // Vindo do 2º tempo para 1ª Prorrogação
            currentHalf = 3;
            elapsedSeconds = (selectedModel.halfDuration * 2); // 90 minutos
            startExtraTimeBtn.textContent = 'Iniciar 2º Prorrogação';
        } else if (currentHalf === 3) { // Vindo da 1ª Prorrogação para 2ª Prorrogação
            currentHalf = 4;
            elapsedSeconds = (selectedModel.halfDuration * 2) + selectedModel.extraTimeDuration; // 90 + 15 minutos = 105 minutos
        }
        startTimer();
    });

    // NOVO: Encerrar Prorrogação (1ª)
    endExtraTimeBtn.addEventListener('click', () => {
        // Captura os acréscimos digitados para a 1ª prorrogação
        additionTime = parseInt(additionTimeInput.value) || 0;
        
        // Garante que o relógio exiba pelo menos o tempo nominal + acréscimos da 1ª prorrogação
        const expectedEndTimeForDisplay = (selectedModel.halfDuration * 2) + selectedModel.extraTimeDuration + additionTime;
        if (elapsedSeconds < expectedEndTimeForDisplay) {
            elapsedSeconds = expectedEndTimeForDisplay;
        }
        updateDisplay();
        currentHalf = 3; // Permanece no estado da 1ª prorrogação para transição

        handleEndOfHalf('readyForExtraTime2'); // Após 1ª prorrogação, ir para a 2ª
    });

    // O endMatchBtn agora é usado no final da 2ª prorrogação
    endMatchBtn.addEventListener('click', () => {
        // Captura os acréscimos digitados para a 2ª prorrogação
        additionTime = parseInt(additionTimeInput.value) || 0;
        
        // Garante que o relógio exiba pelo menos o tempo nominal + acréscimos da 2ª prorrogação
        const expectedEndTimeForDisplay = (selectedModel.halfDuration * 2) + (selectedModel.extraTimeDuration * 2) + additionTime;
        if (elapsedSeconds < expectedEndTimeForDisplay) {
            elapsedSeconds = expectedEndTimeForDisplay;
        }
        updateDisplay();
        currentHalf = 0; // Partida totalmente encerrada
        handleEndOfHalf('matchEnded');
    });

    backToModelBtn.addEventListener('click', () => {
        window.location.href = `index.html`;
    });

    // Inicialização ao carregar a página
    updateDisplay();
    updateButtonVisibility('initial');
});
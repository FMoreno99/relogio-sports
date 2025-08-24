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
    // REMOVIDO: Elementos de acréscimos
    // const additionTimeInput = document.getElementById('addition-time');
    // const additionInputWrapper = document.querySelector('.addition-input-wrapper');
    // const plusSign = document.querySelector('.plus-sign');

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
    let elapsedSeconds = 0; // Representa o tempo EXATO a ser exibido no display
    let isRunning = false;
    let currentHalf = 0; // 0: Não iniciado, 1: 1º Tempo, 2: 2º Tempo, 3: 1ª Prorrogação, 4: 2ª Prorrogação
    // REMOVIDO: Variável para acréscimos
    // let additionTime = 0;

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
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        timer = setInterval(() => {
            elapsedSeconds++;
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
        updateDisplay();
        updateButtonVisibility('reset');
    }

    function handleEndOfHalf(nextState) {
        clearInterval(timer);
        isRunning = false;
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

        // REMOVIDO: Lógica para desabilitar input de acréscimos
        // additionTimeInput.disabled = false;

        switch (state) {
            case 'initial':
                startBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');
                break;
            case 'start':
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                resetBtn.classList.remove('hidden');

                if (currentHalf === 1) halfTimeBtn.classList.remove('hidden');
                if (currentHalf === 2) endSecondHalfBtn.classList.remove('hidden');
                if (currentHalf === 3) endExtraTimeBtn.classList.remove('hidden');
                if (currentHalf === 4) endMatchBtn.classList.remove('hidden');
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
                // REMOVIDO: Lógica para desabilitar input de acréscimos
                // additionTimeInput.disabled = true;
                break;
        }
    }

    // REMOVIDO: A função inteira de checkAdditionTimeVisibility() foi removida.
    // function checkAdditionTimeVisibility() { ... }

    // --- Event Listeners dos Botões ---

    startBtn.addEventListener('click', () => {
        if (currentHalf === 0) {
            elapsedSeconds = 0;
            currentHalf = 1;
        }
        startTimer();
    });

    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Botão "Encerrar 1º Tempo"
    halfTimeBtn.addEventListener('click', () => {
        // Agora, o relógio simplesmente para no tempo atual.
        // O tempo nominal (45:00) será o ponto de referência, e não o tempo exibido.
        elapsedSeconds = selectedModel.halfDuration;
        updateDisplay();
        currentHalf = 1;
        handleEndOfHalf('readyForSecondHalf');
    });

    // NOVO: Iniciar Segundo Tempo
    startSecondHalfBtn.addEventListener('click', () => {
        elapsedSeconds = selectedModel.halfDuration; // 45 minutos
        currentHalf = 2;
        startTimer();
    });

    // Event Listener para o botão "Encerrar 2º Tempo"
    endSecondHalfBtn.addEventListener('click', () => {
        elapsedSeconds = selectedModel.halfDuration * 2; // 90 minutos
        updateDisplay();
        currentHalf = 2;

        if (selectedModel.hasExtraTime) {
            handleEndOfHalf('readyForExtraTime'); // Vai para a tela de iniciar 1ª prorrogação
        } else {
            handleEndOfHalf('matchEnded'); // Finaliza a partida se não houver prorrogação
        }
    });

    // NOVO: Iniciar Prorrogação (1ª ou 2ª)
    startExtraTimeBtn.addEventListener('click', () => {
        if (currentHalf === 2) {
            currentHalf = 3;
            elapsedSeconds = selectedModel.halfDuration * 2; // 90 minutos
            startExtraTimeBtn.textContent = 'Iniciar 2º Prorrogação';
        } else if (currentHalf === 3) {
            currentHalf = 4;
            elapsedSeconds = (selectedModel.halfDuration * 2) + selectedModel.extraTimeDuration; // 90 + 15 minutos = 105 minutos
        }
        startTimer();
    });

    // NOVO: Encerrar Prorrogação (1ª)
    endExtraTimeBtn.addEventListener('click', () => {
        elapsedSeconds = (selectedModel.halfDuration * 2) + selectedModel.extraTimeDuration; // 105 minutos
        updateDisplay();
        currentHalf = 3;

        handleEndOfHalf('readyForExtraTime2'); // Após 1ª prorrogação, ir para a 2ª
    });

    // O endMatchBtn agora é usado no final da 2ª prorrogação
    endMatchBtn.addEventListener('click', () => {
        elapsedSeconds = (selectedModel.halfDuration * 2) + (selectedModel.extraTimeDuration * 2); // 120 minutos
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

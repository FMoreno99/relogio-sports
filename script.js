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
    let elapsedSeconds = 0; 
    let isRunning = false; 
    let currentHalf = 0; 
    let additionTime = 0; // Acréscimos digitados pelo usuário (em segundos)
    let currentPeriodExpectedEndTime = 0; 

    const timeModels = {
        '90min': { halfDuration: 45 * 60, hasExtraTime: false },
        '120min': { halfDuration: 45 * 60, hasExtraTime: true, extraTimeDuration: 15 * 60 },
        '40min': { halfDuration: 20 * 60, hasExtraTime: false } 
    };
    const selectedModel = timeModels[model]; // '120min'

    function updateDisplay() {
        let displaySeconds = elapsedSeconds;
        let mins = Math.floor(displaySeconds / 60);
        let secs = displaySeconds % 60;

        minutesDisplay.textContent = String(mins).padStart(2, '0');
        secondsDisplay.textContent = String(secs).padStart(2, '0');
        
        checkAdditionTimeVisibility(); 
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
        additionTime = 0;
        currentPeriodExpectedEndTime = 0; 
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

        switch (currentHalf) {
            case 1: 
                if (elapsedSeconds >= baseHalfDuration) { // Acréscimos do 1º tempo aparecem após 45:00
                    shouldShow = true;
                }
                break;
            case 2: 
                if (elapsedSeconds >= (baseHalfDuration * 2)) { // Acréscimos do 2º tempo aparecem após 90:00
                    shouldShow = true;
                }
                break;
            case 3: 
                if (elapsedSeconds >= (baseHalfDuration * 2) + baseExtraTimeDuration) { // Acréscimos da 1ª prorrogação aparecem após 105:00
                    shouldShow = true;
                }
                break;
            case 4: 
                if (elapsedSeconds >= (baseHalfDuration * 2) + (baseExtraTimeDuration * 2)) { // Acréscimos da 2ª prorrogação aparecem após 120:00
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
        } else {
            additionInputWrapper.classList.add('hidden');
        }
    }

    // --- Event Listeners dos Botões ---

    startBtn.addEventListener('click', () => {
        // Os acréscimos para o PRIMEIRO TEMPO são capturados aqui antes de iniciar.
        additionTime = parseInt(additionTimeInput.value) || 0; 

        if (currentHalf === 0) { 
            elapsedSeconds = 0; 
            currentHalf = 1;
            // Define o tempo final esperado para o 1º tempo, incluindo acréscimos
            currentPeriodExpectedEndTime = selectedModel.halfDuration + additionTime;
        }
        startTimer();
    });

    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Botão "Encerrar 1º Tempo"
    halfTimeBtn.addEventListener('click', () => {
        // Captura os acréscimos que foram digitados pelo usuário no input
        additionTime = parseInt(additionTimeInput.value) || 0; 
        const firstHalfEndTimeWithAddedTime = selectedModel.halfDuration + additionTime;
        
        // Garante que o relógio esteja pelo menos no tempo de fim de período + acréscimos
        if (elapsedSeconds < firstHalfEndTimeWithAddedTime) {
            elapsedSeconds = firstHalfEndTimeWithAddedTime; 
        }
        updateDisplay(); 
        currentHalf = 1; 
        handleEndOfHalf('readyForSecondHalf'); 
    });

    startSecondHalfBtn.addEventListener('click', () => {
        // Os acréscimos para o SEGUNDO TEMPO são capturados aqui antes de iniciar.
        additionTime = parseInt(additionTimeInput.value) || 0; 
        currentHalf = 2; 
        // Define o tempo final esperado para o 2º tempo, incluindo acréscimos
        currentPeriodExpectedEndTime = (selectedModel.halfDuration * 2) + additionTime;
        startTimer();
    });

    // Event Listener para o botão "Encerrar 2º Tempo"
    endSecondHalfBtn.addEventListener('click', () => {
        // Captura os acréscimos que foram digitados pelo usuário no input para o 2º tempo
        additionTime = parseInt(additionTimeInput.value) || 0; 
        const secondHalfEndTimeWithAddedTime = (selectedModel.halfDuration * 2) + additionTime;
        
        // Garante que o relógio esteja pelo menos no tempo de fim de período + acréscimos
        if (elapsedSeconds < secondHalfEndTimeWithAddedTime) {
            elapsedSeconds = secondHalfEndTimeWithAddedTime;
        }
        updateDisplay();
        currentHalf = 2; 

        if (selectedModel.hasExtraTime) {
            handleEndOfHalf('readyForExtraTime'); // Vai para a tela de iniciar 1ª prorrogação
        } else {
            handleEndOfHalf('matchEnded'); // Não deve acontecer com 120min, mas é uma segurança
        }
    });

    // O endMatchBtn agora só é usado no final da 2ª prorrogação
    endMatchBtn.addEventListener('click', () => {
        // Captura os acréscimos que foram digitados pelo usuário para a 2ª prorrogação
        additionTime = parseInt(additionTimeInput.value) || 0; 
        let finalMatchTime = 0;
        
        // Calculo do tempo final da partida para a 2ª prorrogação
        finalMatchTime = (selectedModel.halfDuration * 2) + (selectedModel.extraTimeDuration * 2) + additionTime;
        
        if (elapsedSeconds < finalMatchTime) {
             elapsedSeconds = finalMatchTime;
        }
        updateDisplay();
        currentHalf = 0; // Partida totalmente encerrada
        handleEndOfHalf('matchEnded'); 
    });

    startExtraTimeBtn.addEventListener('click', () => {
        // Os acréscimos para a PRORROGAÇÃO (1ª ou 2ª) são capturados aqui antes de iniciar.
        additionTime = parseInt(additionTimeInput.value) || 0; 

        if (currentHalf === 2) { // Vindo do 2º tempo para 1ª Prorrogação
            currentHalf = 3;
            currentPeriodExpectedEndTime = (selectedModel.halfDuration * 2) + selectedModel.extraTimeDuration + additionTime; 
            startExtraTimeBtn.textContent = 'Iniciar 2º Prorrogação'; 
        } else if (currentHalf === 3) { // Vindo da 1ª Prorrogação para 2ª Prorrogação
            currentHalf = 4;
            currentPeriodExpectedEndTime = (selectedModel.halfDuration * 2) + (selectedModel.extraTimeDuration * 2) + additionTime;
        }
        startTimer();
    });

    endExtraTimeBtn.addEventListener('click', () => {
        // Captura os acréscimos que foram digitados pelo usuário para a 1ª prorrogação
        additionTime = parseInt(additionTimeInput.value) || 0; 
        const extraTime1EndTimeWithAddedTime = (selectedModel.halfDuration * 2) + selectedModel.extraTimeDuration + additionTime;
        
        // Garante que o relógio esteja pelo menos no tempo de fim da 1ª prorrogação + acréscimos
        if (elapsedSeconds < extraTime1EndTimeWithAddedTime) {
            elapsedSeconds = extraTime1EndTimeWithAddedTime; 
        }
        updateDisplay(); 
        currentHalf = 3; // Garante que o estado ainda é 1ª prorrogação para a transição
        
        handleEndOfHalf('readyForExtraTime2'); // Após 1ª prorrogação, ir para a 2ª
    });

    // O input de acréscimos agora só precisa ser lido quando um botão de 'iniciar' ou 'encerrar' for clicado.
    // O evento 'input' em si não precisa mais atualizar additionTime constantemente, apenas para visualização.
    // Removendo o event listener 'input' para evitar complexidade desnecessária na atualização de `additionTime`
    // additionTimeInput.addEventListener('input', (event) => {
    //     additionTime = parseInt(event.target.value) || 0;
    // });


    backToModelBtn.addEventListener('click', () => {
        window.location.href = `index.html`; 
    });

    // Inicialização ao carregar a página
    updateDisplay(); 
    updateButtonVisibility('initial'); 
});
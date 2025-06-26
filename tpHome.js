let countdownTimer;
let timeLeft = 0; 
let isCounting = false; 
let stopCount = parseInt(localStorage.getItem('stopCount')) || 0;
let userPassword = localStorage.getItem('userPassword') || '6666'; 
let exitAttempts = 0;
let totalDuration = 0; 
let isExiting = false; 
let lastExitRow = 1; 

function loadCountdown() {
    const savedTime = localStorage.getItem('timeLeft');
    if (savedTime) {
        timeLeft = parseInt(savedTime, 10);
        updateDisplay();
    }
    updateStartButtonState(); 
}

function updateStartButtonState() {
    document.getElementById("startButton").disabled = false;
}

function startCountdown() {
    if (isCounting || timeLeft <= 0 || exitAttempts >= 3) return; 
    isCounting = true; 

    const currentTime = getCurrentTime();
    if (lastExitRow <= 3) {
        document.getElementById(`returnTime${lastExitRow}`).textContent = currentTime; 
    }

    countdownTimer = setInterval(function () {
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            alert("Təbriklər! Hədəfinizi tamamladınız.");
            handleCompletion(true); 
            resetCountdown(); 
            return;
        }
        timeLeft--;
        totalDuration++;
        updateDisplay();
    }, 1000); 
}

function stopCountdown(skipPassword = false) {
    if (!skipPassword) {
        const enteredPassword = document.getElementById('passwordInput').value;
        if (enteredPassword !== userPassword) {
            alert('Səhv şifrə! Yenidən cəhd edin.');
            return; 
        }
        const confirmStop = confirm('Geri sayımı dayandırmaq istədiyinizdən əminsiniz?');
        if (!confirmStop) return;
    }

    clearInterval(countdownTimer);
    isCounting = false; 
}

function updateDisplay() {
    let hours = Math.floor(timeLeft / 3600);
    let minutes = Math.floor((timeLeft % 3600) / 60);
    let seconds = timeLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    document.getElementById("Countdown").textContent = `${hours}:${minutes}:${seconds}`;
}

function resetCountdown() {
    timeLeft = 0; 
    totalDuration = 0; 
    localStorage.removeItem('timeLeft');
}

function setCustomTime() {
    const selectedTime = document.getElementById('timeSelect').value;
    const [hours, minutes, seconds] = selectedTime.split(':').map(Number);
    if (hours > 11 || minutes > 59 || seconds > 59) {
        alert("Maksimum vaxt: 11 saat, 59 dəqiqə, 59 saniyədir.");
        return;
    }
    timeLeft = (hours * 3600) + (minutes * 60) + (seconds || 0);
    updateDisplay();
}

function handleCompletion(isCompleted) {
    if (isCompleted) {
        addCheckMarkToTableTimer(); 
    } else {
        addXMarkToTableDay(); 
        if (document.querySelectorAll('#tableTimerDay i.fa-x').length >= 3) {
            alert("Siz bu gün 3 dəfə səhifədən çıxmısınız. Hədəfinizi tamamlamadınız!");
            addXMarkToTableTimer(); 
        }
    }
}

function addCheckMarkToTableTimer() {
    const firstEmptyTd = document.querySelector('#tableTimer td:not(:has(*))');
    if (firstEmptyTd) {
        firstEmptyTd.innerHTML = '<i class="fa-solid fa-check"></i>';
    }
}

function addXMarkToTableDay() {
    if (exitAttempts <= 3) {
        const exitIconCell = document.getElementById(`exitIcon${exitAttempts}`);
        if (exitIconCell) {
            exitIconCell.innerHTML = '<i class="fa-solid fa-x"></i>';
            document.getElementById(`exitTime${exitAttempts}`).textContent = getCurrentTime(); 
        }
    }
}

function addXMarkToTableTimer() {
    const firstEmptyTd = document.querySelector('#tableTimer td:not(:has(*))');
    if (firstEmptyTd) {
        firstEmptyTd.innerHTML = '<i class="fa-solid fa-x"></i>';
    }
}

function handleVisibilityChange() {
    if (document.visibilityState === 'hidden' && isCounting && !isExiting) {
        exitAttempts++;
        isExiting = true;

        if (exitAttempts <= 3) {
            addXMarkToTableDay(); 
            alert("Siz səhifəni tərk etdiniz. Geri qayıdıb geri sayımı davam etdirin!");
        }
    }
    if (document.visibilityState === 'visible') {
        if (exitAttempts <= 3) {
            document.getElementById(`returnTime${exitAttempts}`).textContent = getCurrentTime();
        }
        isExiting = false; 
    }
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

document.addEventListener('DOMContentLoaded', function () {
    loadCountdown();
    document.addEventListener('visibilitychange', handleVisibilityChange);
});

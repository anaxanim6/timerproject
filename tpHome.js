let countdownTimer;
let timeLeft = 0; // Time in seconds
let isCounting = false; // To check if countdown is active
let stopCount = parseInt(localStorage.getItem('stopCount')) || 0; // Number of times stop button was used
let userPassword = localStorage.getItem('userPassword') || '6666'; // Registration password
let exitAttempts = 0; // Number of exit attempts (reset daily)
let totalDuration = 0; // Total duration in seconds
let isExiting = false; // Prevent multiple exit event triggers
let lastExitRow = 1; // Track which row to update in tableTimerDay

function loadCountdown() {
    const savedTime = localStorage.getItem('timeLeft');
    if (savedTime) {
        timeLeft = parseInt(savedTime, 10);
        updateDisplay();
    }
    updateStartButtonState(); // Update the state of the start button
}

function updateStartButtonState() {
    // Ensures the start button is always enabled
    document.getElementById("startButton").disabled = false;
}

function startCountdown() {
    if (isCounting || timeLeft <= 0 || exitAttempts >= 3) return; // Do nothing if countdown is already running
    isCounting = true; // Start countdown

    const currentTime = getCurrentTime();
    if (lastExitRow <= 3) {
        document.getElementById(`returnTime${lastExitRow}`).textContent = currentTime; // Update return time in the table
    }

    countdownTimer = setInterval(function () {
        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            alert("Təbriklər! Hədəfinizi tamamladınız.");
            handleCompletion(true); // Complete session and handle completion
            resetCountdown(); // Reset countdown
            return;
        }
        timeLeft--;
        totalDuration++;
        updateDisplay();
    }, 1000); // Update every second
}

function stopCountdown(skipPassword = false) {
    if (!skipPassword) {
        const enteredPassword = document.getElementById('passwordInput').value;
        if (enteredPassword !== userPassword) {
            alert('Səhv şifrə! Yenidən cəhd edin.');
            return; // Exit function without stopping countdown
        }
        const confirmStop = confirm('Geri sayımı dayandırmaq istədiyinizdən əminsiniz?');
        if (!confirmStop) return;
    }

    clearInterval(countdownTimer);
    isCounting = false; // Stop countdown
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
    timeLeft = 0; // Reset time
    totalDuration = 0; // Reset total duration
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
        addCheckMarkToTableTimer(); // Add check icon to tableTimer
    } else {
        addXMarkToTableDay(); // Add cross icon to tableTimerDay
        if (document.querySelectorAll('#tableTimerDay i.fa-x').length >= 3) {
            alert("Siz bu gün 3 dəfə səhifədən çıxmısınız. Hədəfinizi tamamlamadınız!");
            addXMarkToTableTimer(); // Add cross icon to tableTimer
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
            document.getElementById(`exitTime${exitAttempts}`).textContent = getCurrentTime(); // Update exit time in the table
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
            addXMarkToTableDay(); // Add X mark for each exit attempt
            alert("Siz səhifəni tərk etdiniz. Geri qayıdıb geri sayımı davam etdirin!");
        }
    }
    if (document.visibilityState === 'visible') {
        if (exitAttempts <= 3) {
            document.getElementById(`returnTime${exitAttempts}`).textContent = getCurrentTime(); // Record return time
        }
        isExiting = false; // Reset the exit flag when returning to the page
    }
}

// Utility function to get current time as HH:MM:SS
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Load the countdown and event listeners on page load
document.addEventListener('DOMContentLoaded', function () {
    loadCountdown();
    document.addEventListener('visibilitychange', handleVisibilityChange);
});
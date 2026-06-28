const posLimits = {
    '1-GK': 1,
    '2-DEF': 4,
    '3-MID': 4,
    '4-FWD': 2
};

function togglePlayer(element) {
    const activePage = element.closest('.page-view');
    const pos = element.getAttribute('data-pos');
    
    let startersCount = activePage.querySelectorAll('.is-starter').length;
    let subsCount = activePage.querySelectorAll('.is-sub').length;

    if (element.classList.contains('is-starter')) {
        element.classList.remove('is-starter');
    } else if (element.classList.contains('is-sub')) {
        if (startersCount === 11) {
            alert("Your Starting XI is full. Deselect a starter first to swap players.");
            return;
        }
        element.classList.remove('is-sub');
    } else {
        if (startersCount < 11) {
            const currentPosCount = activePage.querySelectorAll(`.is-starter[data-pos="${pos}"]`).length;
            if (currentPosCount >= posLimits[pos]) {
                alert('This player will be played out of position and incur a penalty.');
            }
            element.classList.add('is-starter');
        } else if (subsCount < 5) {
            element.classList.add('is-sub');
        }
    }

    startersCount = activePage.querySelectorAll('.is-starter').length;
    if (startersCount === 11) {
        const allPlayers = activePage.querySelectorAll('.player-row');
        allPlayers.forEach(p => {
            if (!p.classList.contains('is-starter')) {
                p.classList.add('is-sub');
            }
        });
    } else {
        const allPlayers = activePage.querySelectorAll('.player-row');
        allPlayers.forEach(p => {
            p.classList.remove('is-sub');
        });
    }

    updateUI(activePage);
}

function updateUI(activePage) {
    const startersCount = activePage.querySelectorAll('.is-starter').length;
    const subsCount = activePage.querySelectorAll('.is-sub').length;
    
    activePage.querySelector('.starters-count').innerText = `STARTERS: ${startersCount}/11`;
    activePage.querySelector('.subs-count').innerText = `SUBS: ${subsCount}/5`;
    
    const lockBtn = activePage.querySelector('.lock-btn');
    lockBtn.disabled = !(startersCount === 11 && subsCount === 5);
}

function generateTeamsheet(btnElement) {
    const activePage = btnElement.closest('.page-view');
    const allPlayers = activePage.querySelectorAll('.player-row');
    let startersList = [];
    let subsList = [];

    allPlayers.forEach(player => {
        const name = player.getAttribute('data-name');
        const pos = player.getAttribute('data-pos'); 
        
        if (player.classList.contains('is-starter')) {
            startersList.push({ name: name, pos: pos });
        } else if (player.classList.contains('is-sub')) {
            subsList.push(name); 
        }
    });

    startersList.sort((a, b) => a.pos.localeCompare(b.pos));

    let outputText = "";
    startersList.forEach(p => outputText += p.name + "\n");
    outputText += "SUBS\n"; 
    subsList.forEach(name => outputText += name + "\n");

    const container = activePage.querySelector('.teamsheet-output-container');
    const textArea = activePage.querySelector('.teamsheet-text');
    
    textArea.value = outputText.trim();
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

const GOOGLE_HQ_URL = 'https://script.google.com/macros/s/AKfycbxImRf2rYwjXCs7_fKldtFKTaQZnpZMplXNMonM32ZLWtWi92hsiXiPqhjYhKxp0qFyOw/exec';

// Security Clearance Codes mapped to page IDs
const managerCodes = {
    'team-holt': '11',       
    'team-bareham': '12',    
    'team-andy': '13',       
    'team-paul': '14',       
    'team-smyth': '15',      
    'team-masterman': '16',  
    'team-davies': '17',     
    'team-hodgson': '18',    
    'team-rowe': '19',       
    'team-roach': '20',      
    'team-cotton': '21',     
    'team-barber': '22'      
};

function submitToHQ(btnElement) {
    const activePage = btnElement.closest('.page-view');
    const teamId = activePage.id; 
    
    const enteredCode = prompt("ENTER MANAGER CLEARANCE CODE:");
    
    if (enteredCode !== managerCodes[teamId]) {
        alert("ACCESS DENIED. INCORRECT CLEARANCE CODE.");
        return; 
    }

    const textArea = activePage.querySelector('.teamsheet-text');
    const teamName = activePage.querySelector('h2').innerText;

    const originalText = btnElement.innerText;
    btnElement.innerText = "TRANSMITTING...";
    btnElement.disabled = true;

    fetch(GOOGLE_HQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
            teamName: teamName,
            teamsheet: textArea.value
        })
    })
    .then(response => {
        btnElement.innerText = "DATA RECEIVED AT HQ";
        btnElement.style.borderColor = "var(--accent-green)";
        btnElement.style.color = "var(--accent-green)";
        btnElement.style.boxShadow = "0 0 15px rgba(57, 255, 20, 0.8)";
    })
    .catch(error => {
        alert("TRANSMISSION FAILED. THE MAINFRAME MIGHT BE DOWN.");
        btnElement.innerText = "RETRY SUBMISSION";
        btnElement.disabled = false;
    });
}
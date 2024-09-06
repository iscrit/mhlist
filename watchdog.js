// index.js

// Initialize Chart.js for bigger graph
const ctx = document.getElementById('liveStatsChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Total Players',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            },
            {
                label: 'Total Servers',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }
        ]
    },
    options: {
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Count'
                },
                beginAtZero: true
            }
        }
    }
});

let labels = [];
let playerData = [];
let serverData = [];
let lastPlayerCount = 0;
let lastServerCount = 0;

// Function to fetch data from Minehut API and update table & chart
async function fetchStats() {
    try {
        const response = await fetch('https://api.minehut.com/servers');
        const data = await response.json();
        const totalPlayers = data.total_players;
        const totalServers = data.total_servers;

        // Calculate change
        const playerChange = totalPlayers - lastPlayerCount;
        const serverChange = totalServers - lastServerCount;
        lastPlayerCount = totalPlayers;
        lastServerCount = totalServers;

        // Update the table
        document.getElementById('playerCount').innerText = totalPlayers;
        document.getElementById('serverCount').innerText = totalServers;
        document.getElementById('playerChange').innerText = playerChange > 0 ? `+${playerChange}` : playerChange;
        document.getElementById('serverChange').innerText = serverChange > 0 ? `+${serverChange}` : serverChange;
        document.getElementById('playerUpdateTime').innerText = new Date().toLocaleTimeString();
        document.getElementById('serverUpdateTime').innerText = new Date().toLocaleTimeString();

        // Push new data to the arrays
        const currentTime = new Date().toLocaleTimeString();
        labels.push(currentTime);
        playerData.push(totalPlayers);
        serverData.push(totalServers);

        // Limit the arrays to the last 20 entries
        if (labels.length > 20) {
            labels.shift();
            playerData.shift();
            serverData.shift();
        }

        // Update the chart
        chart.data.labels = labels;
        chart.data.datasets[0].data = playerData;
        chart.data.datasets[1].data = serverData;
        chart.update();

    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Refresh data every second
setInterval(fetchStats, 1000);

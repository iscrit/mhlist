document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.getElementById('refreshButton');
    const toggleAutoRefreshButton = document.getElementById('toggleAutoRefresh');
    const searchInput = document.getElementById('searchInput');
    const streakDisplay = document.getElementById('streak-display');
    const randomServerButton = document.getElementById('findRandomServer');
    const serverList = document.getElementById('server-list');
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');
    const randomServerPopup = document.getElementById('random-server-popup');
    const diceAnimation = document.getElementById('diceAnimation');
    const randomServerDetails = document.getElementById('random-server-details');

    let autoRefreshEnabled = true; // Enabled by default
    let autoRefreshInterval;
    let serverStreaks = {};  // To track streaks for each server
    let currentPage = 0;  // Track the current page for pagination
    const serversPerPage = 10;  // Number of servers to fetch per page

    async function fetchServers(page = 0) {
        try {
            const response = await fetch(`https://api.minehut.com/servers?page=${page}&size=${serversPerPage}`);
            const data = await response.json();
            displayServers(data.servers);
            updateTotalServers(data.total_servers, data.total_players);
            updateBestStreakServer(data.servers);
            currentPage = page;  // Update current page
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    }

    function displayServers(servers) {
        servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.classList.add('server-card');

            const playerCount = server.playerData.playerCount || 0;
            const maxPlayers = server.maxPlayers || 'Unlimited';
            const playerCountText = `${playerCount}/${maxPlayers}`;
            const motd = formatMiniMessage(server.motd);
            const iconUrl = server.icon
                ? `https://minehut-server-icons-live.s3.us-west-2.amazonaws.com/${server.icon}.png`
                : 'https://minehut-server-icons-live.s3.us-west-2.amazonaws.com/GRASS_BLOCK.png'; // Default logo if none exists

            const serverHeader = `
                <img src="${iconUrl}" alt="${server.name} Logo">
                <div class="server-header">${server.name}.minehut.gg <span class="player-count">🙍 ${playerCountText}</span></div>
                <div class="motd">${motd}</div>
                <div class="server-info">
                    <p><strong>Author:</strong> ${server.author} (${server.authorRank})</p>
                    <p><strong>Categories:</strong> ${server.allCategories.join(', ')}</p>
                    <p><strong>Server Plan:</strong> ${server.staticInfo.rawPlan}</p>
                    <p><strong>Always Online:</strong> ${server.staticInfo.alwaysOnline ? 'Yes' : 'No'}</p>
                </div>
            `;

            serverCard.innerHTML = serverHeader;
            serverList.appendChild(serverCard);

            trackStreak(server);  // Track streak for each server
        });
    }

    function formatMiniMessage(motd) {
        return motd
            .replace(/<rainbow>/g, '<span class="rainbow">')
            .replace(/<\/rainbow>/g, '</span>')
            .replace(/<gradient:#([A-Fa-f0-9]{6}):#([A-Fa-f0-9]{6})>/g, (match, color1, color2) => `<span style="background: linear-gradient(to right, #${color1}, #${color2}); -webkit-background-clip: text; color: transparent;">`)
            .replace(/<\/gradient>/g, '</span>')
            .replace(/<color:#([A-Fa-f0-9]{6})>/g, (match, color) => `<span style="color: #${color};">`)
            .replace(/<\/color>/g, '</span>')
            .replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>')
            .replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>')
            .replace(/<u>/g, '<u>').replace(/<\/u>/g, '</u>')
            .replace(/<st>/g, '<strike>').replace(/<\/st>/g, '</strike>')
            .replace(/\n/g, '<br>')  // Handle new lines
            .replace(/<#([A-Fa-f0-9]{6})>/g, (match, color) => `<span style="color: #${color};">`);
    }

    function updateTotalServers(totalServers, totalPlayers) {
        const serverCount = document.getElementById('server-count');
        serverCount.textContent = `${totalServers} servers (${totalPlayers} players)`;
    }

    function trackStreak(server) {
        const playerCount = server.playerData.playerCount;
        const serverName = server.name;

        if (!serverStreaks[serverName]) {
            serverStreaks[serverName] = { streak: 0, lastPlayerCount: playerCount };
        }

        const currentStreak = serverStreaks[serverName].streak;
        const lastPlayerCount = serverStreaks[serverName].lastPlayerCount;

        if (playerCount > lastPlayerCount) {
            serverStreaks[serverName].streak = currentStreak + 1;  // Increase streak
        } else if (playerCount < lastPlayerCount) {
            serverStreaks[serverName].streak = 0;  // Reset streak if a player leaves
        }

        serverStreaks[serverName].lastPlayerCount = playerCount;  // Update last player count
    }

    function updateBestStreakServer(servers) {
        let bestServer = null;
        let bestStreak = 0;

        servers.forEach(server => {
            const serverName = server.name;
            const serverStreak = serverStreaks[serverName]?.streak || 0;

            if (serverStreak > bestStreak) {
                bestStreak = serverStreak;
                bestServer = server;
            }
        });

        if (bestServer) {
            streakDisplay.innerHTML = `<span class="fire-effect">${bestServer.name}.minehut.gg has a streak of ${bestStreak} 🔥</span>`;
        } else {
            streakDisplay.innerHTML = '';
        }
    }

    function searchServers() {
        const query = searchInput.value.toLowerCase();
        const servers = document.querySelectorAll('.server-card');
        servers.forEach(server => {
            const name = server.querySelector('.server-header').textContent.toLowerCase();
            server.style.display = name.includes(query) ? 'block' : 'none';
        });
        stopAutoRefresh();
    }

    function startAutoRefresh() {
        if (!autoRefreshEnabled) {
            autoRefreshInterval = setInterval(fetchServers, 1000);
            toggleAutoRefreshButton.textContent = 'Disable Live Mode';
            autoRefreshEnabled = true;
        }
    }

    function stopAutoRefresh() {
        if (autoRefreshEnabled) {
            autoRefreshInterval = setInterval(fetchServers, 1000);
            toggleAutoRefreshButton.textContent = 'Enable Live Mode';
            autoRefreshEnabled = true;
        }
    }

    function showRandomServerPopup(server) {
        const popup = document.getElementById('random-server-popup');
        const details = document.getElementById('random-server-details');
        const diceAnimation = document.getElementById('diceAnimation');

        // Show the popup immediately
        popup.style.display = 'block';
        overlay.style.display = 'block';

        // Show dice animation and server details
        setTimeout(() => {
            const ctx = diceAnimation.getContext('2d');
            ctx.clearRect(0, 0, diceAnimation.width, diceAnimation.height);
            ctx.font = '48px serif';
            ctx.fillText('https://minehut-server-icons-live.s3.us-west-2.amazonaws.com/GRASS_BLOCK.png', 20, 60);

            setTimeout(() => {
                details.innerHTML = `<p><strong>${server.name}.minehut.gg</strong></p><p>IP: ${server.name}.minehut.gg</p>`;
            }, 500); // Delay before showing server details

            // Close popup after 5.5 seconds
            setTimeout(() => {
                closeRandomServerPopup();
            }, 5500);
        }, 500); // Simulate dice animation duration
    }

    function closeRandomServerPopup() {
        document.getElementById('random-server-popup').style.display = 'none';
        overlay.style.display = 'none';
    }

    async function findRandomServer() {
        try {
            const response = await fetch('https://api.minehut.com/servers');
            const data = await response.json();
            const servers = data.servers;
            const filteredServers = servers.filter(server => server.playerData.playerCount >= 2);
            const randomServer = filteredServers[Math.floor(Math.random() * filteredServers.length)];
            showRandomServerPopup(randomServer);
        } catch (error) {
            console.error('Error finding random server:', error);
        }
    }

    function handleToggleAutoRefresh() {
        if (autoRefreshEnabled) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
        }
    }
    

    refreshButton.addEventListener('click', fetchServers);
    toggleAutoRefreshButton.addEventListener('click', handleToggleAutoRefresh);
    searchInput.addEventListener('input', searchServers);
    randomServerButton.addEventListener('click', findRandomServer);

    // Enable auto-refresh by default
    startAutoRefresh();
    fetchServers(); // Initial fetch

    // Infinite scroll for loading more servers
    serverList.addEventListener('scroll', function() {
        if (serverList.scrollHeight - serverList.scrollTop === serverList.clientHeight) {
            // Fetch the next page of servers when scrolled to the bottom
            fetchServers(currentPage + 1);
        }
    });
});

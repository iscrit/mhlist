document.addEventListener('DOMContentLoaded', () => {
    const pinnedServers = {
        // Add pinned servers here if necessary, for custom backgrounds or highlights
    };

    async function fetchServers() {
        try {
            const response = await fetch('https://api.minehut.com/servers');
            const data = await response.json();
            displayServers(data.servers);
            updateTotalServers(data.total_servers, data.total_players);
        } catch (error) {
            console.error('Error fetching servers:', error);
        }
    }

    function displayServers(servers) {
        const serverList = document.getElementById('server-list');
        serverList.innerHTML = ''; // Clear previous list

        servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.classList.add('server-card');

            // Pinned servers
            if (pinnedServers[server.name]) {
                serverCard.classList.add(pinnedServers[server.name], 'pinned');
            }

            // Add player count next to the server name
            const playerCount = server.playerData.playerCount || 0;
            const maxPlayers = server.maxPlayers || 'Unlimited';

            // Handle player count formatting and downtime
            let playerCountText = `${playerCount}/${maxPlayers}`;
            let playerCountClass = 'player-count';
            if (playerCount < 30) {
                playerCountClass += ' downtime'; // Flag servers with <30 players
            }

            // Create the server tile
            const serverHeader = `
                <div class="server-header">${server.name}.minehut.gg <span class="${playerCountClass}">🙍 ${playerCountText}</span></div>
                <div class="motd">${formatMOTD(server.motd)}</div>
                <div><span class="label">Current Players:</span> <span class="player-count">${playerCountText}</span></div>
                <div><span class="label">Categories:</span> ${server.allCategories.join(', ')}</div>
                <div><span class="label">Author:</span> ${server.author}</div>
            `;

            serverCard.innerHTML = serverHeader;
            serverList.appendChild(serverCard);
        });
    }

    // Function to format MOTD with MiniMessage and HEX color support
    function formatMOTD(motd) {
        if (!motd) return 'No MOTD';
        // Replace MiniMessage formatting with HTML equivalents
        let formattedMOTD = motd
            .replace(/<.*?>/g, '') // Handle MiniMessage tags
            .replace(/<#([0-9a-fA-F]{6})>/g, (match, hex) => `<span style="color:#${hex};">`)
            .replace(/<\/#>/g, '</span>'); // End color formatting
        return formattedMOTD;
    }

    // Update the total number of online servers and players
    function updateTotalServers(totalServers, totalPlayers) {
        const serverCount = document.getElementById('server-count');
        const greenDot = document.querySelector('.green-dot');
        serverCount.textContent = `${totalServers} servers (${totalPlayers} players)`;

        // Check for downtime
        if (totalPlayers < 30) {
            greenDot.style.backgroundColor = '#FF0000';
            greenDot.classList.add('downtime-detected');
            greenDot.textContent = 'Downtime detected';
        } else {
            greenDot.style.backgroundColor = '#4CAF50';
            greenDot.classList.remove('downtime-detected');
            greenDot.textContent = '';
        }
    }

    // Search functionality
    function searchServers() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const servers = document.querySelectorAll('.server-card');
        servers.forEach(server => {
            const name = server.querySelector('.server-header').textContent.toLowerCase();
            server.style.display = name.includes(query) ? 'block' : 'none';
        });
    }

    // Filtering functionality
    function filterServers() {
        const categoryFilter = document.getElementById('filterCategory').value;
        const sizeFilter = document.getElementById('filterSize').value;
        const servers = document.querySelectorAll('.server-card');

        servers.forEach(server => {
            const categories = server.querySelector('.categories').textContent.split(', ');
            const playerCount = parseInt(server.querySelector('.player-count').textContent.split('/')[0]);

            let displayByCategory = categoryFilter === 'all' || categories.includes(categoryFilter);
            let displayBySize = true;

            if (sizeFilter === 'small' && playerCount > 50) {
                displayBySize = false;
            } else if (sizeFilter === 'medium' && (playerCount < 51 || playerCount > 100)) {
                displayBySize = false;
            } else if (sizeFilter === 'large' && playerCount <= 100) {
                displayBySize = false;
            }

            server.style.display = displayByCategory && displayBySize ? 'block' : 'none';
        });
    }

    // Auto-refresh player and server counts every second
    function autoRefreshData() {
        setInterval(fetchServers, 1000); // Refresh every 1 second
    }

    // Infinite scrolling to load more servers
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            // Fetch more servers or append servers when user reaches the bottom of the page
            fetchServers();
        }
    });

    // Initialize the app
    fetchServers();
    autoRefreshData();
});

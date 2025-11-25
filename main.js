/* RetroExchange Main Logic
   - Handles Data Seeding (LocalStorage)
   - Handles Global Navigation States
   - Handles Page Specific Logic
*/

const app = {
    currentUser: null,

    // 1. Initialize Application Data
    init: function() {
        this.seedData();
        this.checkAuth();
        this.highlightNav();
        
        // Determine which page logic to run based on body ID
        const pageId = $('body').attr('id');
        
        if (pageId === 'page-home') this.renderFeatured();
        if (pageId === 'page-shop') this.renderShop();
        if (pageId === 'page-events') this.renderEvents();
        if (pageId === 'page-dashboard') this.renderDashboard();
        if (pageId === 'page-sell') this.checkSellAuth();
    },

    // 2. Data Seeding (LocalStorage)
    seedData: function() {
        if (!localStorage.getItem('games')) {
            const games = [
                { id: 1, title: "Super Mario Bros 3", console: "NES", price: 45.00, image: "🍄", seller: "RetroShop" },
                { id: 2, title: "Sonic the Hedgehog", console: "Genesis", price: 25.00, image: "🦔", seller: "RetroShop" },
                { id: 3, title: "Zelda: Ocarina of Time", console: "N64", price: 60.00, image: "⚔️", seller: "RetroShop" },
                { id: 4, title: "Street Fighter II", console: "SNES", price: 30.00, image: "🥊", seller: "RetroShop" }
            ];
            localStorage.setItem('games', JSON.stringify(games));
        }

        if (!localStorage.getItem('events')) {
            const events = [
                { title: "Retro Game Expo 2025", date: "2025-05-21", location: "Seattle, WA" },
                { title: "Local Swap Meet", date: "2025-06-10", location: "Austin, TX" }
            ];
            localStorage.setItem('events', JSON.stringify(events));
        }

        if (!localStorage.getItem('users')) {
            const users = [
                { username: "admin", password: "password123", email: "admin@retro.com" },
                { username: "player1", password: "p1", email: "p1@retro.com" }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }
    },

    // 3. Auth & Navigation Logic
    checkAuth: function() {
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            this.currentUser = sessionUser;
            $('#nav-login').hide();
            $('#nav-dashboard').show();
            $('#nav-dashboard a').text('Dashboard (' + sessionUser + ')');
        } else {
            $('#nav-login').show();
            $('#nav-dashboard').hide();
        }
    },

    highlightNav: function() {
        // Simple logic to add 'active' class to current page link
        const path = window.location.pathname;
        const page = path.split("/").pop(); // get filename
        
        $('nav a').each(function() {
            const href = $(this).attr('href');
            if (page === href || (page === '' && href === 'index.html')) {
                $(this).addClass('active');
            }
        });
    },

    login: function(user) {
        sessionStorage.setItem('currentUser', user);
        window.location.href = 'dashboard.html';
    },

    logout: function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // 4. Page Specific Renderers
    renderFeatured: function() {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        // Just take the first 4 for the home page
        const featured = games.slice(0, 4);
        this.renderGameGrid(featured, '#featured-grid');
    },

    renderShop: function() {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const filter = $('#shop-filter').val();
        
        let filteredGames = games;
        if (filter && filter !== 'all') {
            filteredGames = games.filter(g => g.console === filter);
        }
        
        this.renderGameGrid(filteredGames, '#shop-grid');
    },

    renderGameGrid: function(games, selector) {
        let html = '';
        if(games.length === 0) {
            $(selector).html('<p>No games found.</p>');
            return;
        }

        games.forEach(game => {
            html += `
                <div class="game-card">
                    <div class="game-image">${game.image}</div>
                    <div class="game-info">
                        <h3>${game.title}</h3>
                        <p style="color:#666; font-size:0.8rem;">${game.console}</p>
                        <div class="price-tag">$${parseFloat(game.price).toFixed(2)}</div>
                        <button class="btn btn-primary" onclick="alert('Added to cart!')" style="width:100%; margin-top:10px;">Add to Cart</button>
                    </div>
                </div>
            `;
        });
        $(selector).html(html);
    },

    renderEvents: function() {
        const events = JSON.parse(localStorage.getItem('events')) || [];
        let html = '';
        
        events.forEach(evt => {
            html += `
                <div class="event-card">
                    <h3>${evt.title}</h3>
                    <p><strong>Date:</strong> ${evt.date}</p>
                    <p><strong>Location:</strong> ${evt.location || 'TBD'}</p>
                    <button class="btn btn-secondary" onclick="alert('QR Code Generated!')" style="margin-top:10px; font-size:0.6rem;">Generate Ticket QR</button>
                </div>
            `;
        });
        
        $('#events-list').html(html);
    },

    renderDashboard: function() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        $('#dash-username').text(this.currentUser);
        
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const myGames = games.filter(g => g.seller === this.currentUser);
        
        if (myGames.length === 0) {
            $('#user-listings').html('<p>You haven\'t listed any games yet.</p>');
        } else {
            let html = '';
            myGames.forEach(game => {
                html += `
                    <div class="game-card">
                        <div class="game-image">${game.image}</div>
                        <h3>${game.title}</h3>
                        <p>$${game.price}</p>
                        <small style="color:green;">Active</small>
                    </div>
                `;
            });
            $('#user-listings').html(html);
        }
    },

    checkSellAuth: function() {
        if (!this.currentUser) {
            alert("Please login to sell items.");
            window.location.href = 'login.html';
        }
    },

    // 5. Utility Logic
    calculateValue: function() {
        const base = parseFloat($('#util-gen').val());
        const multiplier = parseFloat($('#util-cond').val());
        const randomVar = Math.floor(Math.random() * 10); 
        const total = (base * multiplier) + randomVar;
        $('#util-result').text('$' + total.toFixed(2));
    },

    // 6. Admin Logic
    resetData: function() {
        if(confirm("Are you sure? This will wipe all data.")) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    }
};

// --- Document Ready ---
$(document).ready(function() {
    // Initialize App
    app.init();

    // Event Handlers attached via jQuery
    
    // Shop Filter
    $('#shop-filter').change(function() {
        app.renderShop();
    });

    // Login Form
    $('#login-form').submit(function(e) {
        e.preventDefault();
        const inputUser = $('#login-user').val();
        const inputPass = $('#login-pass').val();

        // Get all users from storage
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // VALIDATION LOGIC:
        // 1. Lowercase both usernames for comparison
        // 2. Keep password comparison strict
        const validUser = users.find(u => 
            u.username.toLowerCase() === inputUser.toLowerCase() && 
            u.password === inputPass
        );

        if(validUser) {
            // Success: Log them in
            app.login(validUser.username);
        } else {
            // Failure: Alert the user
            alert("Invalid username or password!");
            // Optional: Clear the password field
            $('#login-pass').val('');
        }
    });

    // Register Form
    $('#register-form').submit(function(e) {
        e.preventDefault();
        const user = $('#reg-user').val();
        const email = $('#reg-email').val();
        const pass = $('#reg-pass').val();
        
        // Regex Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            $('#reg-email-error').show();
            return;
        }

        // 1. Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // 2. Check if username already exists
        if (users.some(u => u.username.toLowerCase() === user.toLowerCase())) {
            alert("Username already taken!");
            return;
        }

        // 3. Create new user object
        const newUser = {
            username: user,
            email: email,
            password: pass
        };

        // 4. Save to LocalStorage
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert("Account created! Please log in.");
        window.location.href = 'login.html';
    });

    // Sell Form
    $('#sell-form').submit(function(e) {
        e.preventDefault();
        
        const newGame = {
            id: Date.now(),
            title: $('#sell-title').val(),
            console: $('#sell-console').val(),
            price: $('#sell-price').val(),
            image: "👾",
            seller: app.currentUser
        };

        const games = JSON.parse(localStorage.getItem('games')) || [];
        games.push(newGame);
        localStorage.setItem('games', JSON.stringify(games));

        $('#sell-msg').text('Item listed successfully!').css('color', 'green').fadeIn();
        $('#sell-form')[0].reset();
        
        setTimeout(() => {
            window.location.href = 'shop.html';
        }, 1500);
    });

    // Admin Event Form
    $('#admin-event-form').submit(function(e) {
        e.preventDefault();
        const newEvent = {
            title: $('#admin-evt-name').val(),
            date: $('#admin-evt-date').val(),
            location: "TBD"
        };
        
        const events = JSON.parse(localStorage.getItem('events')) || [];
        events.push(newEvent);
        localStorage.setItem('events', JSON.stringify(events));
        
        alert("Event Added!");
        window.location.href = 'events.html';
    });
});
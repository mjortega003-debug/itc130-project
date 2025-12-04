/* main.js - RetroExchange
 *
 * Responsibilities:
 *  - Seed demo data into localStorage (games, users)
 *  - Manage simple session-based authentication (sessionStorage)
 *  - Provide page-specific rendering utilities (home/shop/dashboard)
 *  - Wire up form handlers (login/register/sell/admin)
 *
 * NOTES / SECURITY CONSIDERATIONS:
 *  - This is a demo/static implementation: users and passwords are stored in localStorage
 *    and passwords are in plaintext. This is not secure for any production use.
 *  - sessionStorage is used to keep the "currentUser" for the browser session only.
 *  - All client-side checks can be bypassed by a determined user. For a real app,
 *    move auth, persistence, and critical logic to a secure server.
 */

const app = {
    // currentUser is the username string when someone is logged in (null otherwise)
    currentUser: null,

    /* ------------------------------------------------------------
       1) Initialization
       - Seed demo data (only if not present)
       - Check authentication/session state to update nav UI
       - Highlight the active navigation item
       - Run page-specific renderer based on <body id>
       ------------------------------------------------------------ */
    init: function() {
        this.seedData();      // ensure demo data exists
        this.checkAuth();     // set currentUser and update nav visibility
        this.highlightNav();  // mark the active nav item

        // Detect page via body id and run the appropriate renderer.
        // If a page doesn't exist in the switch, nothing happens (safe).
        const pageId = $('body').attr('id');

        if (pageId === 'page-home') this.renderFeatured();
        if (pageId === 'page-shop') this.renderShop();
        if (pageId === 'page-dashboard') this.renderDashboard();
        if (pageId === 'page-sell') this.checkSellAuth();
    },

    /* ------------------------------------------------------------
       2) Data Seeding (localStorage)
       - Only runs when keys are absent so it won't overwrite user data
       - Useful for demo / initial state
       ------------------------------------------------------------ */
    seedData: function() {
        // Seed games
        if (!localStorage.getItem('games')) {
            const games = [
                // Using placeholder images for the demo
                { id: 1, title: "Super Mario Bros 3", console: "NES", price: 45.00, image: "https://files.catbox.moe/7k8x0s.png", seller: "RetroShop" },
                { id: 2, title: "Sonic the Hedgehog", console: "Genesis", price: 25.00, image: "https://files.catbox.moe/6bizrf.png", seller: "RetroShop" },
                { id: 3, title: "Zelda: Ocarina of Time", console: "N64", price: 60.00, image: "https://files.catbox.moe/hfw7my.png", seller: "RetroShop" },
                { id: 4, title: "Street Fighter II", console: "SNES", price: 30.00, image: "https://files.catbox.moe/qmymch.png", seller: "RetroShop" }
            ];
            localStorage.setItem('games', JSON.stringify(games));
        }

        // Seed users (demo only)
        if (!localStorage.getItem('users')) {
            const users = [
                { username: "admin", password: "password123", email: "admin@retro.com" },
                { username: "player1", password: "p1", email: "p1@retro.com" }
            ];
            localStorage.setItem('users', JSON.stringify(users));
        }
    },

    /* ------------------------------------------------------------
       3) Authentication & Navigation Helpers
       - checkAuth: read sessionStorage to set UI state
       - highlightNav: apply "active" class to current nav link
       - login/logout: session changes + redirects
       ------------------------------------------------------------ */
    checkAuth: function() {
        // sessionStorage stores a simple username string under 'currentUser'
        const sessionUser = sessionStorage.getItem('currentUser');

        if (sessionUser) {
            // When present, set internal state and update nav UI
            this.currentUser = sessionUser;
            $('#nav-login').hide();
            $('#nav-dashboard').show();
            // show username in the nav dashboard link
            $('#nav-dashboard a').text('Dashboard (' + sessionUser + ')');
        } else {
            // No session -> show Login link and hide Dashboard
            this.currentUser = null;
            $('#nav-login').show();
            $('#nav-dashboard').hide();
        }
    },

    highlightNav: function() {
        // Add an 'active' class to the nav element that matches the current filename.
        // Works by comparing <a href> to the page file name in window.location.pathname.
        const path = window.location.pathname;
        const page = path.split("/").pop(); // last segment (e.g., 'index.html')

        $('nav a').each(function() {
            const href = $(this).attr('href');
            // Consider index.html as home when path is empty
            if (page === href || (page === '' && href === 'index.html')) {
                $(this).addClass('active');
            }
        });
    },

    // Simple session setter + redirect to dashboard
    login: function(user) {
        sessionStorage.setItem('currentUser', user);
        // After login we navigate to the dashboard which expects the session
        window.location.href = 'dashboard.html';
    },

    // Remove session and return to home
    logout: function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    /* ------------------------------------------------------------
       4) Page-specific renderers
       - These methods query localStorage, build small UI fragments,
         and inject them into the DOM. They are intentionally simple.
       ------------------------------------------------------------ */

    // Home page: show the first N games as featured
    renderFeatured: function() {
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const featured = games.slice(0, 4); // first 4
        this.renderGameGrid(featured, '#featured-grid');
    },

    // Shop page: optionally apply console filter before rendering
    renderShop: function() {
        const games = JSON.parse(localStorage.getItem('games')) || [];

        // Guard: if filter is not present on page, treat as 'all'
        const filterElem = $('#shop-filter');
        const filter = filterElem.length ? filterElem.val() : 'all';

        let filteredGames = games;
        if (filter && filter !== 'all') {
            filteredGames = games.filter(g => g.console === filter);
        }

        this.renderGameGrid(filteredGames, '#shop-grid');
    },

    // Generic grid renderer used by home/shop/dashboard variants
    renderGameGrid: function(games, selector) {
        let html = '';
        if (!Array.isArray(games) || games.length === 0) {
            $(selector).html('<p>No games found.</p>');
            return;
        }

        games.forEach(game => {
            const price = parseFloat(game.price || 0).toFixed(2);
            let imageHtml;

            // Check if image string is a URL or Base64 (contains http or data:)
            if (game.image && (game.image.startsWith('http') || game.image.startsWith('data:'))) {
                imageHtml = `<img src="${game.image}" alt="${game.title}">`;
            } else {
                // Fallback to emoji/text
                imageHtml = game.image || '👾'; 
            }

            html += `
                <div class="game-card">
                    <div class="game-image">${imageHtml}</div>
                    <div class="game-info">
                        <h3>${game.title}</h3>
                        <p style="color:#666; font-size:0.8rem;">${game.console}</p>
                        <div class="price-tag">$${price}</div>
                        <button class="btn btn-primary" onclick="app.addToCart('${game.title}')" style="width:100%; margin-top:10px;">Add to Cart</button>
                    </div>
                </div>
            `;
        });

        $(selector).html(html);
    },

    // Dashboard: shows user-specific listings and requires auth
    renderDashboard: function() {
        // If there's no logged-in user, redirect to login for safety
        if (!this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Update username placeholder
        $('#dash-username').text(this.currentUser);

        // Find games where seller matches currentUser
        const games = JSON.parse(localStorage.getItem('games')) || [];
        const myGames = games.filter(g => g.seller === this.currentUser);

        if (myGames.length === 0) {
            $('#user-listings').html('<p>You haven\'t listed any games yet.</p>');
        } else {
            let html = '';
            myGames.forEach(game => {
                
                // --- NEW IMAGE LOGIC START ---
                let imageHtml;
                // Check if image string is a URL or Base64 (contains http or data:)
                if (game.image && (game.image.startsWith('http') || game.image.startsWith('data:'))) {
                    imageHtml = `<img src="${game.image}" alt="${game.title}">`;
                } else {
                    // Fallback to emoji/text
                    imageHtml = game.image || '👾'; 
                }
                // --- NEW IMAGE LOGIC END ---

                html += `
                    <div class="game-card">
                        <div class="game-image">${imageHtml}</div>
                        <div class="game-info">
                            <h3>${game.title}</h3>
                            <p>$${parseFloat(game.price || 0).toFixed(2)}</p>
                            <small style="color:green; font-weight:bold;">● Active Listing</small>
                            </div>
                    </div>
                `;
            });
            $('#user-listings').html(html);
        }
    },

    // Sell page: ensure user is authenticated before allowing access to sell form
    checkSellAuth: function() {
        if (!this.currentUser) {
            alert("Please login to sell items.");
            window.location.href = 'login.html';
        }
    },

    addToCart: function(gameTitle) {
        if (!this.currentUser) {
            if(confirm("You must be logged in to shop. Go to login?")) {
                window.location.href = 'login.html';
            }
        } else {
            // In a real app, this would add to a database/array
            alert(gameTitle + " added to your cart!");
        }
    },

    /* ------------------------------------------------------------
       5) Admin / Debug helpers
       - resetData: clears localStorage and sessionStorage after confirmation
       - WARNING: destructive operation used for debugging only
       ------------------------------------------------------------ */
    resetData: function() {
        if (confirm("Are you sure? This will wipe all data.")) {
            localStorage.clear();
            sessionStorage.clear();
            location.reload();
        }
    }
};

/* -----------------------
   Document Ready: wire up event handlers
   - Keep handlers lightweight and delegate complex logic to `app`
   ----------------------- */
$(document).ready(function() {
    // Initialize app state & render the active page
    app.init();

    /* -----------------------
       UI Event Handlers
       ----------------------- */

    // Shop filter: re-render shop grid when filter changes
    $('#shop-filter').change(function() {
        app.renderShop();
    });

    // LOGIN handler
    $('#login-form').submit(function(e) {
        e.preventDefault();

        // Get entered values
        const inputUser = $('#login-user').val();
        const inputPass = $('#login-pass').val();

        // Load users from storage (demo data)
        const users = JSON.parse(localStorage.getItem('users')) || [];

        /* Validation approach:
           - compare usernames case-insensitively (so "Admin" and "admin" match)
           - compare passwords exactly (case-sensitive)
           NOTE: This is still insecure because passwords are client-side.
        */
        const validUser = users.find(u =>
            u.username.toLowerCase() === (inputUser || '').toLowerCase() &&
            u.password === inputPass
        );

        if (validUser) {
            // Set session and go to dashboard
            app.login(validUser.username);
        } else {
            alert("Invalid username or password!");
            // Clear password field for convenience
            $('#login-pass').val('');
        }
    });

    // REGISTER handler
    $('#register-form').submit(function(e) {
        e.preventDefault();

        const user = $('#reg-user').val();
        const email = $('#reg-email').val();
        const pass = $('#reg-pass').val();

        // Email format validation using a lightweight regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            // Show the error message element (was hidden by default in CSS)
            $('#reg-email-error').show();
            return;
        } else {
            $('#reg-email-error').hide();
        }

        // Retrieve existing users and check for collisions (case-insensitive)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.username.toLowerCase() === (user || '').toLowerCase())) {
            alert("Username already taken!");
            return;
        }

        // Build new user record (demo only)
        const newUser = {
            username: user,
            email: email,
            password: pass
        };

        // Persist new user and prompt next action
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert("Account created! Please log in.");
        window.location.href = 'login.html';
    });

    // SELL FORM handler
    $('#sell-form').submit(function(e) {
        e.preventDefault();

        if (!app.currentUser) {
            alert('You must be logged in to list an item.');
            window.location.href = 'login.html';
            return;
        }

        // 1. Get simple text values
        const title = $('#sell-title').val();
        const consoleType = $('#sell-console').val();
        const price = $('#sell-price').val();
        
        // 2. Handle File Input
        const fileInput = document.getElementById('sell-image');
        const file = fileInput.files[0];

        // Define the function that actually saves the game
        function saveGame(imageValue) {
            const newGame = {
                id: Date.now(),
                title: title,
                console: consoleType,
                price: price,
                image: imageValue, // Will be Base64 string OR default emoji
                seller: app.currentUser
            };

            const games = JSON.parse(localStorage.getItem('games')) || [];
            games.push(newGame);
            localStorage.setItem('games', JSON.stringify(games));

            $('#sell-msg').text('Item listed successfully!').css('color', 'green').fadeIn();
            $('#sell-form')[0].reset();
            setTimeout(() => { window.location.href = 'shop.html'; }, 1500);
        }

        // 3. Logic: If file exists, process it. If not, save with default.
        if (file) {
            // Size Check (Limit to 500KB to save localStorage space)
            if (file.size > 500000) {
                alert("File is too large! Please use an image under 500KB.");
                return;
            }

            const reader = new FileReader();
            
            // When reader loads the file data...
            reader.onload = function(event) {
                const base64String = event.target.result;

                // Create an image object to check dimensions
                const img = new Image();
                img.src = base64String;

                img.onload = function() {
                    // Dimension Check (Strict 300x200)
                    // You can change !== to > if you want to allow smaller images
                    if (this.width > 300 || this.height > 200) {
                        alert("Image dimensions must be max 300x200px.");
                        return;
                    }
                    
                    // If dimensions are good, save!
                    saveGame(base64String);
                };
            };
            
            // Start reading the file
            reader.readAsDataURL(file);

        } else {
            // No file uploaded? Use generic emoji fallback
            saveGame("👾");
        }
    });
});

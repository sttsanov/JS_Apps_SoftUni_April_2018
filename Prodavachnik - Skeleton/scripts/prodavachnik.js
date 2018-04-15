let requester = (() => {
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_r1pOzux3z';
    const appSecret = '64ee4bef803e4643a8a81c8114e0271f';

    function makeAuth(type) {
        if (type === 'basic') return 'Basic ' + btoa(appKey + ':' + appSecret);
        else return 'Kinvey ' + localStorage.getItem('authtoken');
    }

    function makeRequest(method, module, url, auth) {
        return req = {
            url: baseUrl + module + '/' + appKey + '/' + url,
            method,
            headers: {
                'Authorization': makeAuth(auth)
            }
        };
    }

    function get(module, url, auth) {
        return $.ajax(makeRequest('GET', module, url, auth));
    }

    function post(module, url, data, auth) {
        let req = makeRequest('POST', module, url, auth);
        req.data = JSON.stringify(data);
        req.headers['Content-Type'] = 'application/json';
        return $.ajax(req);
    }

    function update(module, url, data, auth) {
        let req = makeRequest('PUT', module, url, auth);
        req.data = JSON.stringify(data);
        req.headers['Content-Type'] = 'application/json';
        return $.ajax(req);
    }

    function remove(module, url, auth) {
        return $.ajax(makeRequest('DELETE', module, url, auth));
    }

    return {
        get, post, update, remove
    }
})();

function startApp() {
    $('header').find('a').show();
    const adsDiv = $('#ads').find('table');

    function showView(view) {
        $('section').hide();
        switch (view) {
            case 'home':
                $('#viewHome').show();
                break;
            case 'login':
                $('#viewLogin').show();
                break;
            case 'register':
                $('#viewRegister').show();
                break;
            case 'ads':
                $('#viewAds').show();
                $('#ads').show();
                $(() => loadAds());
                break;
            case 'create':
                $('#viewCreateAd').show();
                break;
            case 'details':
                $('#viewDetailsAd').show();
                break;
            case 'edit':
                $('#viewEditAd').show();
                break;
        }
    }

    function navigateTo(e) {
        $('section').hide();
        let target = $(e.target).attr('data-target');
        $('#' + target).show();
    }

    // Attach event listeners
    $('#linkHome').click(() => showView('home'));
    $('#linkLogin').click(() => showView('login'));
    $('#linkRegister').click(() => showView('register'));
    $('#linkListAds').click(() => showView('ads'));
    $('#linkCreateAd').click(() => showView('create'));
    $('#linkLogout').click(logout);

    $('#buttonLoginUser').click(login);
    $('#buttonRegisterUser').click(register);
    $('#buttonCreateAd').click(createAd);
    $('#buttonEditAd').click(editAd);

    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').fadeOut()
    });

    $('#infoBox').click((event) => $(event.target).hide());
    $('#errorBox').click((event) => $(event.target).hide());

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').fadeOut(), 3000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    function handleError(reason) {
        showError(reason.responseJSON.description);
    }

    if (localStorage.getItem('authtoken') !== null &&
        localStorage.getItem('username') !== null) {
        userLoggedIn();
    } else {
        userLoggedOut();
    }
    showView('home');

    function  userLoggedIn() {
        $('#loggedInUser').text(`Welcome ${localStorage.getItem('username')}!`);
        $('#loggedInUser').show();
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkListAds').show();
        $('#linkCreateAd').show();
        $('#linkLogout').show();
    }
    function  userLoggedOut() {
        $('#loggedInUser').text('');
        $('#loggedInUser').hide();
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkListAds').hide();
        $('#linkCreateAd').hide();
        $('#linkLogout').hide();
    }

    function saveSession(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data._id);
        localStorage.setItem('authtoken', data._kmd.authtoken);
        userLoggedIn();
    }

    async function login() {
        let form = $('#formLogin');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();

        try {
            let data = await requester.post('user', 'login', {username, password}, 'basic');
            showInfo('Logged in');
            saveSession(data);
            showView('ads');
        } catch (err) {
            handleError(err);
        }
    }

    async function register() {
        let form = $('#formRegister');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();
        try {
            let data = await requester.post('user', '', {username, password}, 'basic');
            showInfo('Registered');
            saveSession(data);
            showView('ads');
        }catch (e) {
            handleError(e);
        }
    }

    async function logout() {
        try {
            let data = await requester.post('user', '_logout', {authtoken: localStorage.getItem('authToken')});
            localStorage.clear();
            showInfo('Logged Out');
            userLoggedOut();
            showView('home');
        }catch (e) {
            handleError(e);
        }
    }

    async function loadAds(){
        let data = await requester.get('appdata', 'ads');
        adsDiv.empty();
        adsDiv.append("<table>\n" +
            "<tr>\n" +
            "<th>Title</th>\n" +
            "<th>Publisher</th>\n" +
            "<th>Description</th>\n" +
            "<th>Price</th>\n" +
            "<th>Date Published</th>\n" +
            "</table>");
        if (data.length === 0){
            adsDiv.append('<p>No ads in Database</p>');
            return;
        }
        for (let ad of data){
            let html = $('<tr>');
            html.addClass('ad-box');
            let title = $(`<th class='ad-title'>${ad.title}</th>`);

            html.append(title);
            html.append(`<th>${ad.publisher}</th>`);
            html.append(`<th>${ad.description}</th>`);
            html.append(`<th> Price: ${Number(ad.price).toFixed(2)}</th>`);
            html.append(`<th>${ad.datePublished}</th>`)
            if(ad._acl.creator === localStorage.getItem('id')){
                let deleteBtn = $('<th><button>&#10006;</button></th>').click(() => deleteAd(ad._id));
                deleteBtn.addClass('ad-control');
                deleteBtn.appendTo(html);
                let editBtn = $('<th><button>&#9998;</button></th>').click(() => openEditAd(ad));
                editBtn.addClass('ad-control');
                editBtn.appendTo(html);
            }
            adsDiv.append(html)
        }
    }

    function openEditAd(ad) {
        let form = $('#formEditAd');
        form.find('input[name="title"]').val(ad.title);
        form.find('textarea[name="description"]').val(ad.description);
        form.find('input[name="price"]').val(ad.price);

        form.find('input[name="id"]').val(ad._id);
        form.find('input[name="publisher"]').val(ad.publisher);
        form.find('input[name="datePublished"]').val(ad.datePublished);
        showView('edit');
    }

    async function editAd() {
        let form = $('#formEditAd');
        let title = form.find('input[name="title"]').val();
        let description = form.find('textarea[name="description"]').val();
        let price = form.find('input[name="price"]').val();
        let id = form.find('input[name="id"]').val();
        let publisher = form.find('input[name="publisher"]').val();
        let datePublished = form.find('input[name="datePublished"]').val();

        if (title.length === 0){
            showError("Title cannot be empty");
            return;
        }

        if (Number.isNaN(price)){
            showError('Price cannot be empty');
            return;
        }

        let editedAd = {
            title, description, price, id, publisher, datePublished
        };

        try {
            await requester.update('appdata', 'ads/' + id, editedAd);
            showInfo("Ad Edited");
            showView('ads');
        }catch (e) {
            handleError(e);
        }
    }
    
    async function deleteAd(id){
        await requester.remove('appdata', 'ads/' + id);
        showInfo("Ad deleted");
        showView('ads');
    }
    
    async function createAd() {
        let form = $('#formCreateAd');
        let title = form.find('input[name="title"]').val();
        let description = form.find('textarea[name="description"]').val();
        let price = form.find('input[name="price"]').val();
        let id = form.find('input[name="id"]').val();
        let publisher = localStorage.getItem('username');
        let datePublished = (new Date()).toDateString('yyyy-MM-dd');

        if (title.length === 0){
            showError("Title cannot be empty");
            return;
        }

        if (Number.isNaN(price)){
            showError('Price cannot be empty');
            return;
        }

        let newAd = {
            title, description, price, id, publisher, datePublished
        }

        try {
            await requester.post('appdata', 'ads', newAd);
            showInfo("Ad posted");
            showView('ads');
        }catch (e) {
            handleError(e);
        }
    }
}
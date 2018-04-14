$(function() {
    const URL = 'https://phonebook-56d11.firebaseio.com/Phonebook';
    const name = $('#person');
    const phone = $('#phone');

    $('#btnLoad').on('click', loadData);
    $('#btnCreate').on('click', postData);
    function loadData() {
        $('#phonebook').empty()
        $.ajax({
            method: 'GET',
            url: URL + '.json'
        }).then(handleSuccess)
            .catch(handleError)

        function handleSuccess(res) {
            for (let key in res) {
                generateLi(res[key].person, res[key].number, key)
            }
        }
    }
    function handleError(err) {
        console.log(err);
    }
    function generateLi(name, phone, key){
        console.log(name);
        let li = $(`<li>${name}: ${phone}</li>`)
            .append(`<a href=#>[Delete]</a> `)
            .on('click', function () {
                $.ajax({
                    method: "DELETE",
                    url: URL + '/' + key + '.json'
                }).then(loadData);
            });
        $('#phonebook').append(li);
    }
    function postData() {
        let person = name.val();
        let number = phone.val();
        let postData = JSON.stringify({'person': person, 'number': number});
        $.ajax({
            method: 'POST',
            url: URL + '.json',
            data: postData,
            success: appendElement,
            error: handleError
        });
        function appendElement(res) {
            generateLi(person, number, res.person);
        }
        name.val(' ');
        phone.val(' ');
    }
});
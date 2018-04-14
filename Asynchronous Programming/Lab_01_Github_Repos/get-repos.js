function loadComm() {
    let username = $('#username').val();
    let repo = $('#repo').val();
    let ul = $('#commits');
    ul.empty();
    // Fetching repos with .then and .catch
    // $.get(`https://api.github.com/repos/${username}/${repo}/commits`)
    //     .then((function (res) {
    //         for (let ele of res) {
    //             ul.append(`<li>${ele.commit.author.name}: ${ele.commit.message}</li>`);
    //         }
    //     }))
    //     .catch((function (err) {
    //         ul.append(`<li>Error: ${err.status} (${err.status.text})</li>`)
    //     }))

    // Fetching repos with $.ajax
    $.ajax({
        url: `https://api.github.com/repos/${username}/${repo}/commits`,
        success:(function (res) {
            for (let ele of res) {
                ul.append(`<li>${ele.commit.author.name}: ${ele.commit.message}</li>`);
            }
        }),
        error:(function (err) {
            ul.append(`<li>Error: ${err.status} (${err.status.text})</li>`)
        })
    })
}
const baseUrl = 'https://baas.kinvey.com/appdata/kid_Skx_Xflnf/';
const username = 'peter';
const password = 'p';


function attachEvents() {
    let loadPostsBtn = $('#btnLoadPosts');
    let selectPost = $('#posts');
    let viewPostBtn = $('#btnViewPost');
    let postTitle = $('#post-title');
    let postBody = $('#post-body');
    let postComments = $('#post-comments');
    // Attaching Event Listeners
    loadPostsBtn.on('click', loadPosts);
    viewPostBtn.on('click', viewPost);

    // Implementing 'Load Posts' Functionality
    function loadPosts(){$.ajax({
        url: baseUrl + 'posts',
        headers:{
            'Authorization': 'Basic ' + btoa(username + ':' + password)
        }
    }).then(function (posts) {
        for (let post of posts) {
            let postId = post._id;
            selectPost.append('<option id =' + postId + `>${post.title}</option>`)
        }
    });
    }
    
    // Implementing 'View Post' Functionality
    function viewPost() {
        $.ajax({
            headers:{
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            },
            method: 'GET',
            url: `${baseUrl}posts/${String($('#posts').find("option:selected").attr('id'))}`
        }).then(function (post) {
           document.getElementById('post-title').textContent = post.title;
           document.getElementById('post-body').textContent = post.body;

            $.ajax({
                headers:{
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                },
                method:'GET',
                url: baseUrl + 'comments'
            }).then(function (comments) {
                $('#post-comments').empty();
                for (let comment of comments) {
                    if (comment.post_id === $('#posts').find("option:selected").attr('id')){
                        console.log("works");
                        postComments.append(`<li>${comment.text}</li>`);
                    }
                }
            })
        })
    }
}
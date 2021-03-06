let database = firebase.database();

function writeCategoryData(userId, name, email, imageUrl) {
    firebase.database().ref('category/' + userId).set({
        username: name,
        email: email,
        profile_picture: imageUrl
    });
}
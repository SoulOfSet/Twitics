let userId = "";
let offset = 0;
let followers = [];
let following = [];
let currentlyProcessing = false;
let cursor = "";

let changeTab = (tab)=>{
    setErr("");
    if (tab === "unfollowers") {
        $("#twi-unfollower-section").show();
        $("#twi-lookup-section").hide();
        $("#twi-unfollower-tab").addClass("active");
        $("#twi-lookup-tab").removeClass("active");
    } else {
        $("#twi-unfollower-section").hide();
        $("#twi-lookup-section").show();
        $("#twi-unfollower-tab").removeClass("active");
        $("#twi-lookup-tab").addClass("active");
        setFollowStatus("");
    }
};

let lookupUser = ()=>{
    setErr("");
    $(".twi-twitch-data-viewer").hide();
    $(".twi-loader").show();
    let twitchName = $("#twi-unfollower-uname-input").val();

    if (twitchName !== undefined && twitchName !== "") {
        $.get("/twitch/get_user", {user: twitchName}, function (data, status) {
            if(isBadStatus(status)){
                $(".twi-loader").hide();
                setErr("An error occurred retrieving the data")
            } else if(data.error){
                $(".twi-loader").hide();
                setErr(data.error);
                following = [];
            } else{
                if(data.users.length === 0){
                    setErr("Username does not exist");
                    $(".twi-loader").hide();
                    return;
                }
                $(".twi-loader").hide();
                $(".twi-twitch-data-viewer").show();
                $("#twi-twitch-name").text(data.users[0].name);
                $("#twi-twitch-data-img").attr("src", data.users[0].logo);
                userId = data.users[0]._id;
            }
        });
    } else{
        $(".twi-loader").hide();
        setErr("No name means no game");
    }
};


let getAllUnfollowers = ()=>{

    $('#twi-twitch-submit').hide();
    $(".twi-loader").show();

    if(currentlyProcessing){
        setErr("Chill the fuck out. It's workin. Give it time");
        return;
    } else{
        currentlyProcessing = true;
    }

    //Reset vars
    following = [];
    followers = [];
    offset = 0;
    cursor = "";

    setErr("");

    getFollowers(()=>{
        offset = 0;
        getFollowing(()=>{
            currentlyProcessing = false;
            displayUnfollowers();
            $('#twi-twitch-submit').show();
            $(".twi-loader").hide();
        });
    });
};

let getFollowing = (callback)=>{
    if (userId !== undefined && userId !== "") {
        $.get("/twitch/get_following", {userId: userId, offset: offset}, function (data, status) {
            if(isBadStatus(status)){
                setErr("An error occurred retrieving the data");
                following = [];
                callback();
            } else if(data.error){
                setErr(data.error);
                following = [];
                callback();
            } else{
                let followingData = data;
                following = following.concat(followingData.following);
                if(followingData.total > offset){
                    offset = offset + 100;
                    getFollowing(callback);
                } else{
                    callback();
                }
            }
        });
    } else{
        $(".twi-loader").hide();
        setErr("No user has been loaded");
    }
};

let getFollowers = (callback)=>{

    if (userId !== undefined && userId !== "") {
        $.get("/twitch/get_followers", {userId: userId, offset: offset, cursor: cursor}, (data, status)=>{
            if(isBadStatus(status)){
                setErr("An error occurred retrieving the data");
                followers = [];
                callback();
            } else if(data.error){
                setErr(data.error);
                following = [];
                callback();
            } else{
                let followerData = data;
                followers = followers.concat(followerData.followers);
                if(followerData.total > followers.length){
                    offset = offset + 100;
                    if(offset > 1600){
                        cursor = followerData.cursor;
                        offset = 0;
                    }
                    getFollowers(callback);
                } else{
                    callback();
                }
            }
        });
    } else{
        $(".twi-loader").hide();
        setErr("No user has been loaded");
    }
};


let displayUnfollowers = () => {
    let unfollowers = [];
    $('.twi-unfollower-list').empty();

    for(let i of following){
        if(followers.indexOf(i) === -1){
            unfollowers.push(i);
        }
    }

    $('#twi-unfollower-modal').modal('show');

    if(unfollowers.length === 0){
        $('.twi-unfollower-list').append("<li class='list-group-item'>No unfollowers found :)</li>");
    }

    unfollowers.forEach((entry) =>{
        $('.twi-unfollower-list').append("<li class='list-group-item' onclick=\"window.open('http://twitch.tv/" + entry + "')\">" + entry + "</li>");
    });



};

let checkIsFollowing = ()=>{

    $('#twi-twitch-check').hide();
    $('.twi-loader').show();

    setErr("");
    setFollowStatus("");
    let followee = $('#twi-lookup-followee').val().toLowerCase();
    let follower = $('#twi-lookup-follower').val().toLowerCase();

    if(follower === "" || followee === ""){
        setErr("We need names boi");
        $('#twi-twitch-check').show();
        $('.twi-loader').hide();
    } else{
        $.get("/twitch/get_is_following", {follower: follower, followee: followee}, (data, status)=>{
            console.log("wat");
            if(isBadStatus(status)){
                setErr("An error occurred retrieving the data");
                followers = [];
            } else if(data.error){
                setErr(data.error);
                following = [];
            } else{
                if(data.status === true){
                    setFollowStatus(follower + " is following " + followee);
                } else{
                    setFollowStatus(follower + " is NOT following " + followee);
                }
            }
            $('#twi-twitch-check').show();
            $('.twi-loader').hide();

        }).fail((xhr)=>{
            $('#twi-twitch-check').show();
            $('.twi-loader').hide();
            console.log(xhr);
            setErr(xhr.responseJSON.error)
        });
    }
};

let isBadStatus = (status)=>{
  return status === "error" || status === "timeout" || status === "parsererror";
};

let setFollowStatus = (status)=>{
    $('#twi-follow-stat-msg').text(status);
};

let setErr = (err)=>{
  $('#twi-err-msg').text(err);
};

$(document).ready(()=>{
    $('input#twi-unfollower-uname-input').keydown(function (e) {
        if (e.keyCode === 32) {
            return false;
        }
    });

    $('input.twi-text-input').keydown((e)=>{
        if (e.keyCode === 32) {
            return false;
        }
    });
});
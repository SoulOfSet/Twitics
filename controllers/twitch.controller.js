const request = require('request');

const CONFIG = require("../config/config");
const TWITCH_USER_BY_ID_BASE_URL = "https://api.twitch.tv/kraken/users?login=";

exports.getUserData = (user, callback) => {
    request({
        headers: {
            'Client-ID': CONFIG.twitchKey,
            'Accept': 'application/vnd.twitchtv.v5+json'
        },
        uri: TWITCH_USER_BY_ID_BASE_URL+user,
        method: 'GET'
    }, callback);
};

exports.getFollowing = (userId, offset, callback)=>{

    collectFollowing(userId, offset, (err, followingTotal, following)=>{
        if(err){
            callback(err);
        } else{
            callback(null, {total: followingTotal, following: following})
        }
    });

};

exports.getFollowers = (userId, offset, cursor, callback)=>{

    collectFollowers(userId, offset, cursor, (err, followerTotal, followerCursor, followers)=>{
        if(err){
            callback(err);
        } else{
            callback(null, {total: followerTotal, cursor: followerCursor, followers: followers});
        }
    });

};

let collectFollowers = (userId, offset, cursor, callback)=>{

    let propertiesObject;
    let twitchGetChannelFollowsURL = `https://api.twitch.tv/kraken/channels/${userId}/follows`;

    if(cursor !== null && cursor !== ''){
        propertiesObject = {limit: 100, offset: offset, cursor: cursor};
    } else{
        propertiesObject = {limit: 100 , offset: offset};
    }

    request({
        headers: {
            'Client-ID': CONFIG.twitchKey,
            'Accept': 'application/vnd.twitchtv.v5+json'
        },
        qs: propertiesObject,
        uri: twitchGetChannelFollowsURL,
        method: 'GET'
    }, (err, res, body)=>{
        if(getError(body, err)){
            callback(new Error("An error occurred when collecting followers: " + getError(body, err)));
        } else{
            let followerData = JSON.parse(body);
            let followerSet = followerData.follows.map(a => a.user.name);
            callback(null, followerData._total, followerData._cursor, followerSet);
        }
    });
};

let collectFollowing = (userId, offset, callback)=>{
    let twitchGetUserFollowsURL = `https://api.twitch.tv/kraken/users/${userId}/follows/channels`;
    let propertiesObject = {limit: 100 , offset: offset};
    request({
        headers: {
            'Client-ID': CONFIG.twitchKey,
            'Accept': 'application/vnd.twitchtv.v5+json'
        },
        qs: propertiesObject,
        uri: twitchGetUserFollowsURL,
        method: 'GET'
    }, (err, res, body)=>{
        if(getError(body, err)){
            callback(new Error("An error occurred when collecting following: " + getError(body, err)));
        } else{
            let followingData = JSON.parse(body);
            let followingSet = followingData.follows.map(a => a.channel.name);
            callback(null, followingData._total, followingSet);
        }
    });
};

exports.checkIsFollowing = (followee, follower, callback)=>{

    this.getUserData(followee + "," + follower, (err, rez, body)=>{
        let followeeId = "";
        let followerId = "";

        if(getError(body, err)){
            callback(new Error("An error occurred when checking follow status: " + getError(body, err)));
        } else{
            let userData = JSON.parse(body);

            if(userData.users.length !== 2){
                callback(new Error("Unable to find all specified users"));
            } else{
                userData.users.forEach((entry)=>{
                    if(entry.name === follower.toLowerCase()){
                        followerId = entry._id;
                    } else{
                        followeeId = entry._id;
                    }
                });

                let twitchGetIsFollowingURL = `https://api.twitch.tv/kraken/users/${followerId}/follows/channels/${followeeId}`;

                request({
                    headers: {
                        'Client-ID': CONFIG.twitchKey,
                        'Accept': 'application/vnd.twitchtv.v5+json'
                    },
                    uri: twitchGetIsFollowingURL,
                    method: 'GET'
                }, (err, res, body)=>{
                    if(getError(body, err)){
                        callback(new Error("An error occurred when checking follow status: " + getError(body, err)));
                    } else{
                        let isFollowingData = JSON.parse(body);

                        if(isFollowingData.error){
                            if(isFollowingData.error === "Not Found" && isFollowingData.message === "Follow not found"){
                                callback(null, false);
                            } else{
                                callback(new Error(isFollowingData.message));
                            }
                        } else if(isFollowingData.channel){
                            callback(null, true);
                        } else{
                            callback(new Error("Something went wrong"));
                        }
                    }
                });
            }
        }
    });
};


let getError = (bodyErr, err)=>{
    if(err && err.message){
        return err.message
    }

    let errorJson = JSON.parse(bodyErr);
    if(errorJson.error.message){
        return errorJson.error.message;
    } else if(errorJson.error){
        return errorJson.error;
    } else{
        return null;
    }
}
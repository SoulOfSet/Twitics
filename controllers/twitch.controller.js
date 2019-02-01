const request = require('request');

const CONFIG = require("../config/config");
const TWITCH_USER_BY_ID_BASE_URL = "https://api.twitch.tv/kraken/users?login=";

let following = [];
let followers = [];
let twitchGetUserFollowsURL = "";
let twitchGetChannelFollows = "";

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

exports.getUnfollowers = (userId, callback)=>{
    twitchGetUserFollowsURL = `https://api.twitch.tv/kraken/users/${userId}/follows/channels`;
    twitchGetChannelFollows = `https://api.twitch.tv/kraken/channels/${userId}/follows`;

    following = [];
    followers = [];

    collectFollowing(0, (err)=>{
        if(err){
            callback(err);
        } else{
            collectFollowers(0, null, (err)=>{
                if(err){
                    callback(err);
                } else{
                    console.log(following.length);
                    console.log(followers.length);
                    let unfollowers = [];
                    for(let i of following){
                        if(followers.indexOf(i) === -1){
                            unfollowers.push(i);
                        }
                    }
                    callback(null, unfollowers);
                }
            });

        }
    });

};

let collectFollowers = (offset, cursor, callback)=>{

    let propertiesObject;

    if(cursor !== null){
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
        uri: twitchGetChannelFollows,
        method: 'GET'
    }, (err, res, body)=>{
        if(err || JSON.parse(body).error){
            console.log(body);
            callback(new Error("An error occurred when collecting followers: " + JSON.parse(body).error.message));
        } else{
            let followerData = JSON.parse(body);
            let followerSet = followerData.follows.map(a => a.user.name);
            followers = followers.concat(followerSet);
            let newOffSet = (offset + 100);

            if(followerData._total > newOffSet){
                if(newOffSet > 1600){
                    cursor = followerData._cursor;
                    newOffSet = 0;
                }
                collectFollowers(newOffSet, cursor, callback);
            } else{
                callback(null);
            }
        }
    });
};

let collectFollowing = (offset, callback)=>{

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
        if(err){
            callback(new Error("An error occurred when collecting following: " + JSON.parse(body).error.message));
        } else{
            let followingData = JSON.parse(body);
            let followingSet = followingData.follows.map(a => a.channel.name);
            following = following.concat(followingSet);

            if(followingData._total > (offset + 100)){
                collectFollowing((offset + 100), callback);
            } else{
                callback(null);
            }
        }
    });
};


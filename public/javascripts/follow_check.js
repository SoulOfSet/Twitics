let userId = "";

let changeTab = (tab)=>{
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
                setErr("An error occurred retrieving the data")
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
                console.log(data.users);
                userId = data.users[0]._id;
            }
        });
    } else{
        $(".twi-loader").hide();
        setErr("No name means no game");
    }
};

let isBadStatus = (status)=>{
  return status === "error" || status === "timeout" || status === "parsererror";
};

let setErr = (err)=>{
  $('#twi-err-msg').text(err);
};
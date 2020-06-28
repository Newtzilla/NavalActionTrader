function startTradersTool() {
    if (typeof Ports === 'undefined'
        || typeof Nations === 'undefined'
        || typeof ItemTemplates === 'undefined'
        || typeof Shops === 'undefined'
    ) {
        console.log("Data is missing");

        var text = "";

        text += "<a class=\"navbar-brand\" href=\"#\">" + "Data is missing" + "</a>";
        text += "<a href=\"#\" onclick=\"window.location.reload(true);\">Change server/Reload</a>";

        document.getElementById("shards").innerHTML = text;
    }

    showTradersTool();

}

var shards = [];
var realmConfigPath = "";

function setActiveRealms(data) {
    shards = [];
    for (var i = 0; i < data.data.length; i++) {
        shards.push({ name: data.data[i].title, url: data.data[i].name });
    }
    realmConfigPath = "https://storage.googleapis.com/nacleanopenworldprodshards/";

    showShardSelector();
}

var usePublicShards = true;
if (usePublicShards) {
    var apiKey = "1ZptRtpXAyEaBe2SEp63To1aLmISuJj3Gxcl5ivl"; // TEMP, should be obtained from Slik
    var serverListPath = "http://api.shipsofwar.net/servers?apikey=" + apiKey + "&callback=setActiveRealms";

    $.ajax({ url: serverListPath, dataType: 'jsonp', jsonpCallback: 'setActiveRealms' });
}

function showShardSelector() {
    var shardSelector = "";

    shardSelector += "Please select realm: ";
    for (var i = 0; i < shards.length; i++) {
        shardSelector += "<button type=\"button\" class=\"btn btn-default\" onclick=\"selectShard('" + shards[i].url + "')\">" + shards[i].name + "</button>";
    }

    document.getElementById("shards").innerHTML = shardSelector;
}

function loadScript(name) {
    return $.getScript(realmConfigPath + name + ".json");
}

function changeRealm() {
    location.reload();
}

function createShardSelector(name) {
    var text = "";

    text += "<a class=\"navbar-brand\" href=\"#\">" + name + "</a>";
    text += "<a href=\"#\" onclick=\"window.location.reload(true);\">change</a>";

    document.getElementById("shards").innerHTML = text;
}

function selectShard(name) {
    document.getElementById("shards").innerHTML = "Loading data for " + name;
    loadScript("ItemTemplates_" + name).done(loadScript("Ports_" + name).done(loadScript("Nations_" + name).done(loadScript("Shops_" + name).done(
        setTimeout(function () {
            startTradersTool();
            createShardSelector(name);
        }, 5000)))));
}

if (!usePublicShards) {
    showShardSelector();
}
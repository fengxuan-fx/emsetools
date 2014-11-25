function getRecordParams4SecurityCommNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table

    var thisArr = new Array();
    var tsiVal = "";

    addParameter(params, "$$REPLACE THIS WITH ACTUAL PARAM IN EMAIL TEMPLATE$$", tsiVal);

    return params;
}
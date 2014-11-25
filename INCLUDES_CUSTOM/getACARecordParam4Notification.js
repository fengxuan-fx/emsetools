function getACARecordParam4Notification(params,acaUrl) {
    // pass in a hashtable and it will add the additional parameters to the table

    var itemCap = capId;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    addParameter(params, "$$acaRecordUrl$$", getACARecordURL(acaUrl,itemCap));
    
    return params;  
}
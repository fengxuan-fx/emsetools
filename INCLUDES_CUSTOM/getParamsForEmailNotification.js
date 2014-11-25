function getParamsForEmailNotification(params,license) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
    var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
    var thisArr = new Array();
    //loadTaskSpecific(thisArr);
    //var tsiVal = "";

	var capType=license.getCapType();
	capType=capType.toString();
	var appTypeArray= new Array();
	aapTypeArray=capType.split("/");
    //addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", license.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", sysDateMMDDYYYY);
    addParameter(params, "$$altID$$", license.getCapID().getCustomID());
	addParameter(params, "$$licenseTypeThirdLevel$$", appTypeArray[2]);
	
    return params;
}
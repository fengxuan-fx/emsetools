function getRecordParams4AdditionalNotification(params) {
    // pass in a hashtable and it will add the additional parameters to the table
    var sysDate = aa.date.getCurrentDate();
   // var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),(sysDate.getDayOfMonth()+15),sysDate.getYear(),"");
   var tDate=sysDateMMDDYYYY;
   var emailDateParameter= new Date(); //(Date.parse
   logDebug("Todays Date" + emailDateParameter);
   emailDateParameter.setDate(emailDateParameter.getDate() + 15);
   logDebug("Email Date Parameter: " + (emailDateParameter.getMonth() +1) + "/" + emailDateParameter.getDate() + "/" + emailDateParameter.getFullYear());
   var month = (emailDateParameter.getMonth() +1);
   var emailDate=  month + "/" + emailDateParameter.getDate() + "/" + emailDateParameter.getFullYear();
   logDebug("Email Date" + emailDate);
    var thisArr = new Array();
    //loadTaskSpecific(thisArr);
    //var tsiVal = "";

    //addParameter(params, "$$TASKSPECIFICINFO$$", tsiVal);
    addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
    addParameter(params, "$$CURRENTDATE$$", emailDate);
    addParameter(params, "$$altID$$", capIDString);
	addParameter(params, "$$licenseTypeThirdLevel$$", appTypeArray[2]);
	
    return params;
}
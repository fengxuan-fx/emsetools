function sendEmailNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile, capId) {
    logDebug("Template name: " + templateName);
	
	var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args

    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;

    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);


    var result = null;
	//var array= new Array();
	//array[0]= reportFile;
	
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess()) {
        logDebug("Sent email successfully!");
        return true;
    }
    else {
        logDebug("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}

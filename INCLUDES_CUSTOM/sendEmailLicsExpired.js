/*function sendEmailLicsIssuedNotice() {

    var wFlowTask = "License Issuance";
    var wfStatus = "Issued";
    var sendEmailToContactType = "Applicant";
    var FromEmailAddress = "noreply@accela.com";


    if ((getwfTaskStatus(wFlowTask) == wfStatus) && (allTasksComplete(capId))) {
        aa.print("allTasksComplete:" + allTasksComplete(capId));

        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];

            if (b3Contact["contactType"] = sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("exists(b3Contact[contactType]:" + b3Contact["email"]);
                    //send email
                    SendEmail(FromEmailAddress, toEmailAddress, "License Issued.", "<a href='www.accela.com/'>www.accela.com</a>");
                }
            }
        }
    }

}
*/
// Send email

function sendEmailLicsExpired(capID) {
    var wFlowTask = "No Workflow Required";                           // wflowTask
    var wfStatus = "No Workflow Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@agriculture.ny.gov";
    var toEmailAddress = "";

    var tmplName = "LICENSE HAS EXPIRED NOTICE";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        logDebug("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    logDebug("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();
					logDebug("Cap Type: " + cap.getCapType().getAlias());
					logDebug("Custom ID: " + capID.getCustomID());
					addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
					addParameter(params, "$$licAltID$$", capID.getCustomID());
					addParameter(params, "$$licenseTypeThirdLevel$$", appTypeArray[2]);
					getRecordParams4AdditionalNotification(params);
					addParameter(params, "$$expDate$$", capID.getExpDate());
					
                    

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}

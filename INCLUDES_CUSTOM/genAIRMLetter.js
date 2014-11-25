function genAIRMLetter() {
    var wFlowTask = "Milk Industry Review";                           // wflowTask
    var wfStatus = "Additional Info Required"; //Generate Letter for Underpayment, No Payment, Additional Information Needed";                          // wflowStatus
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@agriculture.ny.gov";
    var toEmailAddress = "";

   var tmplName = "ADDITIONAL INFORMATION REQUIRED";

    //aa.print("TASK:" + getwfTaskStatus(wFlowTask));

    if (getwfTaskStatus(wFlowTask) == wfStatus) {
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];
            aa.print("b3Contact[contactType]:" + b3Contact["contactType"]);
            if (b3Contact["contactType"] == sendEmailToContactType) {
                toEmailAddress = b3Contact["email"];
                if (toEmailAddress != null) {
                    aa.print("toEmailAddress:" + toEmailAddress);
                    var params = aa.util.newHashtable();

                    getRecordParams4AdditonalNotification(params);
					getRecordParams4AdditionalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
}
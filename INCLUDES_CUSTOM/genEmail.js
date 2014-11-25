function genEmail(license,emailTemplateName) {
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@agriculture.ny.gov";
    var toEmailAddress = "";

    var tmplName = emailTemplateName;
	logDebug("Template name inside genEmail: " + tmplName);
    var conArray = getContactArray(license.getCapID());

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
					//getACARecordParam4Notification(params,acaUrl);
                    getParamsForEmailNotification(params,license);

                    //send email
                    sendEmailNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null,license.getCapID());
                }
            }
        }
    }
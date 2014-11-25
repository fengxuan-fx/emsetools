function genAppLetter() {
    var sendEmailToContactType = "Business"; //Applicant";
    var FromEmailAddress = "noreply@agriculture.ny.gov";
    var toEmailAddress = "";

    var tmplName = "Application Received";

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
					getACARecordParam4Notification(params,acaUrl);
                    getRecordParams4AdditionalNotification(params);

                    //send email
                    sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);
                }
            }
        }
    }
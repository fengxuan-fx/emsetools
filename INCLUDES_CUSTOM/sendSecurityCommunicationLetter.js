function sendSecurityCommunicationLetter() {

    var sendEmailToContactType = "Business";
    var FromEmailAddress = "noreply@agriculture.ny.gov";
    var toEmailAddress = "";

    var tmplName = ""; //template name

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
                // var params = aa.util.newHashtable();
                // getRecordParams4SecurityCommNotification(params);

                //send email
                //sendNotification(FromEmailAddress, toEmailAddress, "", tmplName, params, null);

                //temp email send method remove this once you get the template for this script
                email(toEmailAddress, FromEmailAddress, "the security amount to be deposited to the applicant", "the security amount to be deposited to the applicant");
            }
        }
    }

}
function SendEmail(fromEmailAddress, toEmailAddress, mSubj, mText) {
    var replyTo = fromEmailAddress;
    aa.print("emailAddress=" + toEmailAddress);

    if (toEmailAddress != null) {
        if (toEmailAddress.indexOf("@") > 0) {
            aa.sendMail(replyTo, toEmailAddress, "", mSubj, mText);
            aa.print("Successfully sent email to " + toEmailAddress);
        }
        else
            aa.print("Couldn't send email to " + toEmailAddress + ", no valid email address");
    }
}
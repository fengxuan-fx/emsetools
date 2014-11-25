function updateLicsfromRenewal() {

    var appGroup = "Licenses";
    var appType = "";
    var appSubtype = "";
    var appCategory = "License";

    //get parent license
    var pCapID = getMatchingParent(appGroup, appType, appSubtype, appCategory);

    //aa.print("getMatchingParent:" + getMatchingParent(appGroup, appType, appSubtype, appCategory).getCustomID());

    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var con = Contacts[yy];
            //delete the matching contact type on parent and copy contact from renewal/amendment
            copyContacts2Parent(capId, pCapID, con.getCapContactModel().getPeople().getContactType());
        }
    }


}
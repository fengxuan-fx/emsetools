function closeRelatedLicenses() {
    var contactType = "Applicant";
    var fullName = "";
    var servProvider = "agm";
    var newAppStatus = "Inactive";


    var capContactResult = aa.people.getCapContactByCapID(capId);

    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType())) {
                if (Contacts[yy].getCapContactModel().getRefContactNumber() != null) {

                    //get full name
                    fullName = Contacts[yy].getPeople().firstName + " " + Contacts[yy].getPeople().lastName;

                    // create a people model
                    var pModel = aa.people.createPeopleModel();
                    if (pModel.getSuccess()) {
                        var attrs = pModel.getOutput();

                        // setup the attributes of the people object
                        attrs.setFullName(fullName);
                        attrs.setServiceProviderCode(servProvider);   // agency code is required
                        attrs.setContactType(contactType);    //  contact type is required

                        // var r = aa.people.createPeople(p.getPeopleModel());  // need to pass the peopleModel object to this method

                        var cResult = aa.people.getCapIDsByRefContact(attrs);  // needs 7.1

                        if (cResult.getSuccess()) {
                            var a = cResult.getOutput();
                            for (var j in a) {
                                ccapId = a[j].getCapID();

                                //get app type
                                var ArrCapId = ccapId.toString().split("-");

                                licCapId = aa.cap.getCapID(ArrCapId[0], ArrCapId[1], ArrCapId[2]).getOutput();
                                aa.print("Cap Custom ID:" + licCapId.getCustomID());

                                var cap = aa.cap.getCap(ccapId).getOutput(); //
                                var appTypeResult = cap.getCapType().toString();

                                var arrAppType = appTypeResult.split("/");
                                //aa.print("appType:" + arrAppType[3] + "--Status:" + cap.getCapStatus());

                                if (arrAppType[3].toUpperCase().equals("LICENSE")) {
                                    aa.print("appType:" + arrAppType[3] + "--Status:" + cap.getCapStatus());
                                    if (!cap.getCapStatus().toUpperCase().equals("CANCELED")) {
                                        aa.print("Status:" + cap.getCapStatus());
                                        b1ExpResult = aa.expiration.getLicensesByCapID(licCapId);
                                        if (b1ExpResult.getSuccess()) {
                                            var b1Exp = b1ExpResult.getOutput();

                                            // update expiration status
                                            b1Exp.setExpStatus(newAppStatus);
                                            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());

                                            aa.print(licCapId.getCustomID() + ": Update expiration status: " + newAppStatus);

                                            var capStatus = b1Exp.getExpStatus();

                                            // update CAP status
                                            if (capStatus != "Canceled") {
                                                updateAppStatus(newAppStatus, "", licCapId);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

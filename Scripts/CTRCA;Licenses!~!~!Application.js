updateAppStatus("Received Online","");
closeTask("Application Intake","Received","Updated via script","");
//syncRefContact();
//createPublicUserFromContact();
//createParent("Licenses","Establishment","NA","NA","New Estab");

createOrUpdateEstablishments();

genAppLetter();


if (publicUser) {
	var bConObj = getContactObj(capId,"Business");

	if (bConObj) {
		if (!bConObj.hasPublicUser()) {
			bConObj.linkToPublicUser(publicUserID);
		}
	}
}


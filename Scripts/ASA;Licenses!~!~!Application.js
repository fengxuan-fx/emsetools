//if (!publicUser) 
{
	updateAppStatus("Received","");
	closeTask("Application Intake","Received","Updated via script","");
	params = aa.util.newHashtable();
	getACARecordParam4Notification(params,acaUrl);
	addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
	getRecordParams4Notification(params);
	getContactParams4Notification(params,"Business");
	sendNotification(sysFromEmail,params.get("$$applicantEmail$$"),"","APPLICATION RECEIVED",params,null);
	//Send notice to create a NYS License Center account if needed
	var appConObj = getContactObj(capId,"Business");
	if (!appConObj.hasPublicUser())
		appConObj.sendCreateAndLinkNotification();

	}

createOrUpdateEstablishments();

//Get Establishment Number and Populate Plant Industry Establishment #
var estID = getParent();
var gp = getParent().getCustomID();
logDebug("Parent Number for Rick :" + gp);
var AInfo = new Array();
    loadApplSpecific(AInfo, capId);
editAppSpecificWithGroup("Establishment #",gp, estID, AInfo);
//editAppSpecific("Establishment #",gp,gp);
//End Establishment # Update

if (!publicUser) 
{
	genAppLetter();
}
	
logDebug("Establishment ID:  " + getParent());

var custID = estID.getCustomID();

logDebug("EST Custom ID: " + estID.getCustomID());
		
var bConObj = getContactObj(estID,"Business");

	if (bConObj) {
		if (!bConObj.hasPublicUser()) {
			bConObj.linkToPublicUser(publicUserID);

		}

	}
	
	if(appMatch("Licenses/Plant/Nursery Grower/Application"))
	{
		scheduleInspect(estID,"Nursery Grower",10);
	}

	//contactAddressCheck();



function createParent(grp, typ, stype, cat, desc, itemCap)
//
// creates the new application and returns the capID object
// updated by JHS 10/23/12 to use copyContacts that handles addresses
//
{
	logDebug("Inside createParent Function");
	logDebug("CapID:" + capId);
	//capId = itemCap;
	if(arguments.length > 5){
		itemCap = arguments[5]; // use cap ID specified in args
	}
	else{
		itemCap = capId;
	}
	var cCap = aa.cap.getCap(itemCap).getOutput();
	var cAppTypeResult = cCap.getCapType();
	var cAppTypeString = cAppTypeResult.toString();
	var cAppTypeArray = cAppTypeString.split("/");

	var newLicenseType = cAppTypeArray[2];
	logDebug("Custom Cap ID" + itemCap.getCustomID());
	var gp = AInfo['Parent Record ID'];
	var gpc = null;
	gpc = aa.cap.getCapID(AInfo['Parent Record ID']).getOutput();
	
	logDebug("Parent Cap ID" + gpc);
	var thisCap = gpc;//capId;
	if (arguments.length > 4)
        thisCap = arguments[4];

    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess()) {
        var newId = appCreateResult.getOutput();
		
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput(); //Cap object
		if(appMatch("Licenses/*/*/Application") || newLicenseType== "Nursery Grower"){
		logDebug("Its an application record");
		var result = aa.cap.createAppHierarchy(newId, itemCap);
		}
		else{
        result = aa.cap.createAppHierarchy(newId, gpc);
		}
        if (result.getSuccess())
            logDebug("Parent application successfully linked");
        else
            logDebug("Could not link applications");

        // Copy Parcels

        var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
        if (capParcelResult.getSuccess()) {
            var Parcels = capParcelResult.getOutput().toArray();
            for (zz in Parcels) {
                logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                newCapParcel.setParcelModel(Parcels[zz]);
                newCapParcel.setCapIDModel(newId);
                newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                aa.parcel.createCapParcel(newCapParcel);
            }
        }

        // Copy Contacts

        copyContacts(itemCap, newId);

        // Copy Addresses
        capAddressResult = aa.address.getAddressByCapId(itemCap);
        if (capAddressResult.getSuccess()) {
            Address = capAddressResult.getOutput();
            for (yy in Address) {
                newAddress = Address[yy];
                newAddress.setCapID(newId);
                aa.address.createAddress(newAddress);
                logDebug("added address");
            }
        }

        return newId;
    }
    else {
        logDebug("**ERROR: adding parent App: " + appCreateResult.getErrorMessage());
    }
}

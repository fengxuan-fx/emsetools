function createLicenseNumforProduct() {
    
    myCap = aa.cap.getCap(capId).getOutput();
    myAppTypeString = myCap.getCapType().toString();
    myAppTypeArray = myAppTypeString.split("/");

    if (myAppTypeArray[3] == "Application") {
        parentLic = getParentLicenseCapID(capId);
        pLicArray = String(parentLic).split("-");
        var parentLicID = getParent(); 
        aa.print("parentLicID:" + parentLicID);
    } else {
        var parentLicID = getParentCapID4Renewal();
        aa.print("parentLicID:" + parentLicID.getCustomID());
    }

    var tblName = "LIME BRAND";
    var sColName = "License #";

    //load LIME BRAND asit
    var arrASIT = loadASITable(tblName, parentLicID);

    if (typeof (arrASIT) == "object") {
        if (arrASIT.length > 0) {
            aa.print("arrASIT.length:" + arrASIT.length);
            updateLimeBrandASITable(parentLicID, tblName, sColName);
        }
    }
}
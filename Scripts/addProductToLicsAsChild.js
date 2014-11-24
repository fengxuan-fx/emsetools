function addProductToLicsAsChild() {
    var capType = "Licenses/Plant/Soil or Plant Inoculant/Product";
    var appGroup = "Licenses";
    var appType = "";
    var appSubtype = "";
    var appCategory = "License";

    var arrProdCaps = getChildren(capType, capId);
	if(arrProdCaps != null){

    for (itemCap in arrProdCaps) {
        var childId = arrProdCaps[itemCap];

        aa.print("arrProdCaps:" + childId.getCustomID());

        var thisCap = aa.cap.getCap(childId).getOutput();
        var thisCapStatus = thisCap.getCapStatus();

        aa.print("thisCapStatus:" + thisCapStatus);

        if (thisCapStatus != null) {
            aa.print("thisCapStatus:" + thisCapStatus);

            if (thisCapStatus != "Approved") {
                continue;
            }

            //get parent license
            var pLicsCap = getMatchingParent(appGroup, appType, appSubtype, appCategory);

            aa.print("pLicsCap:" + pLicsCap.getCustomID());

            var result = aa.cap.createAppHierarchy(pLicsCap, childId);
            if (result.getSuccess()) {
                aa.print("Link2Caps-Child application successfully linked");
            } else {
                aa.print("Link2Caps-Could not link applications");
            }

        }
    
	}
	}

}
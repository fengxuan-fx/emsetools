function copyChildren(appType, appStatus, pId) {

    var childrenArray = new Array();

    childrenArray = getChildren(appType);

    if (childrenArray.length > 0) {

        for (xx in childrenArray) {
            thisChild = childrenArray[xx];

            var thisCap = aa.cap.getCap(thisChild).getOutput();
            var thisCapStatus = thisCap.getCapStatus();

            if (thisCapStatus == appStatus) {
                var linkResult = aa.cap.createAppHierarchy(pId, thisChild);
                if (linkResult.getSuccess())
                    logDebug("Successfully linked to License : " + thisChild.getCustomID());
                else
                    logDebug("ERROR: linking to lincese (" + thisChild.getCustomID() + "): " + linkResult.getErrorMessage());
            }
        }

        logDebug("Successfully linked the children to the parent");
        return true;
    } else {
        logDebug("No children found");
        return false;
    }
}
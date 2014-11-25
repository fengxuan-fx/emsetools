function getEstParent(pAppType,appRenewID) {
    // returns the capId of parent cap Establishment
    
    var i = 1;
    while (true) {
        if (!(aa.cap.getProjectParents(appRenewID, i).getSuccess()))
            break;

        i += 1;
    }
    i -= 1;

    getCapResult = aa.cap.getProjectParents(appRenewID, i);
    myArray = new Array();
    
    if (getCapResult.getSuccess()) {
        parentArray = getCapResult.getOutput();

        if (parentArray.length) {
            for (x in parentArray) {
                if (pAppType != null) {
                    //get the app type
                    matchCap = aa.cap.getCap(parentArray[x].getCapID()).getOutput();
                    matchArray = matchCap.getCapType().toString().split("/");

                    //If parent type matches appType return capid
                    if (matchArray[1].equals(pAppType)) {
                        //aa.print("parentArray[x].getCapID()" + parentArray[x].getCapID());
                        return parentArray[x].getCapID();
                    }
                }
            }

            return null;
        }
        else {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return null;
        }
    }
    else {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return null;
    }
}
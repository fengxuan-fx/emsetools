 function addParent(parentAppNum)
//
// adds the current application to the parent
//
{
    itemCap = capId;
    if (arguments.length == 2) {
        itemCap = arguments[1]; // subprocess

    }

    var getCapResult = aa.cap.getCapID(parentAppNum);
    if (getCapResult.getSuccess()) {
        var parentId = getCapResult.getOutput();
        var linkResult = aa.cap.createAppHierarchy(parentId, itemCap);
        if (linkResult.getSuccess())
            logDebug("Successfully linked to Parent Application : " + parentAppNum);
        else
            logDebug("**ERROR: linking to parent application parent cap id (" + parentAppNum + "): " + 

linkResult.getErrorMessage());
    }
    else
    { logDebug("**ERROR: getting parent cap id (" + parentAppNum + "): " + getCapResult.getErrorMessage()) }
}


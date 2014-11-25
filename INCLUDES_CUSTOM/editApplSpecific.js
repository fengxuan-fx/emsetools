function editApplSpecific(itemName, itemValue, itemCap, AInfo)  // optional: itemCap
{
    var updated = false;
    var useAppSpecificGroupName = false;
    var i = 0;

    //itemCap = capId;

    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0)
        { aa.print("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false; }

        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();
        if (itemName != "") {
            while (i < appspecObj.length && !updated) {
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
                    appspecObj[i].setChecklistComment(itemValue);

                    var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
                    if (actionResult.getSuccess()) {
                        aa.print("app spec info item " + itemName + " has been given a value of " + itemValue);
                    }
                    else {
                        aa.print("**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " + actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
                    }

                    updated = true;
                    AInfo[itemName] = itemValue;  // Update array used by this script
                }

                i++;

            } // while loop
        } // item name blank
    } // got app specific object    
    else {
        aa.print("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
    }
} //End Function
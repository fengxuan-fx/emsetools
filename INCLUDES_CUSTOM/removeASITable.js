function removeASITable(tableName, NewCapID) // optional capId
{
    //  tableName is the name of the ASI table
    //  tableValues is an associative array of values.  All elements MUST be strings.
    var itemCap = NewCapID;
    //if (arguments.length > 1)
    //  itemCap = arguments[1]; // use cap ID specified in args

    var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName, itemCap, currentUserID);

    if (!tssmResult.getSuccess())
    { aa.print("**WARNING: error removing ASI table " + tableName + " " + tssmResult.getErrorMessage()); return false; }
    else
        logDebug("Successfully removed all rows from ASI Table: " + tableName);
}
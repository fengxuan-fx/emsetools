function createSet(setName,setDescription,setType,setStatus,setStatusComment) {

    //optional 3rd parameter is setType
    //optional 4th parameter is setStatus
    //optional 5th paramater is setStatusComment


    //var setType = "";
    //var setStatus = "";
    //var setStatusComment = "";


    /* if (arguments.length > 2) {
        setType = arguments[2]
    }


    if (arguments.length > 3) {
        setStatus = arguments[3]
    }


    if (arguments.length > 4) {
        setStatusComment = arguments[4];
    } */

    //logDebug("Inside create set");

    var setScript = aa.set.getSetHeaderScriptModel().getOutput();
    setScript.setSetID(setName);
    setScript.setSetTitle(setDescription);
    setScript.setSetComment(setStatusComment);
    setScript.setSetStatus(setStatus);
    setScript.setRecordSetType(setType);
    setScript.setServiceProviderCode(aa.getServiceProviderCode());
    setScript.setAuditDate(aa.date.getCurrentDate());
    setScript.setAuditID(currentUserID);


    var setCreateResult = aa.set.createSetHeader(setScript);
    //logDebug("Result: " + setCreateResult.getSuccess());
   
    return setCreateResult.getSuccess();
} 
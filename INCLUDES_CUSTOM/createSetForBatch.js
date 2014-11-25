function createSetForBatch(setName,setDescription,setType,setStatus,setStatusComment, currentUserID) {
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
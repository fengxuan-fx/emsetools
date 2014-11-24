gp = getParent();
if (wfTask == "Amendment Review" && wfStatus == "Approved") {
	updateAppStatus("Inactive","Updated via Script",gp);

	var pId = getParent();
	var gId;
	if (pId)
		var gId = getParentByCapId(pId);

	if (gId) {
		if (gId) {
	        var pCap = aa.cap.getCap(gId).getOutput();
	        var pAppTypeResult = pCap.getCapType();
			var pAppTypeString = pAppTypeResult.toString();
			var pAppTypeArray = pAppTypeString.split("/");

			if (matches(pAppTypeArray[2],"Nursery Grower","Nursery Dealer")) {
				createRefLP4Lookup4NurseryGrowerDealer(gId);
			} else {
				createRefLP4Lookup(gId);
			}
		}
	} 

}
//Add this to your onload pageflow script
function setSpecificASI(gName,fName,fValue) {
	var asiGroups = cap.getAppSpecificInfoGroups()
	for (i = 0; i < asiGroups.size(); i++) {
		if (asiGroups.get(i).getGroupName() == gName) {
			for (x = 0; x < asiGroups.get(i).getFields().size(); x++) {
				if (asiGroups.get(i).getFields().get(x).getCheckboxDesc() == fName) {
					asiGroups.get(i).getFields().get(x).setChecklistComment(fValue);
					cap.setAppSpecificInfoGroups(asiGroups);
					logDebug("ASI field " + fName + " updated to " + fValue);
					return true;
				}
			}
		}
	}
	logDebug("ASI field " + fName + " not updated to " + fValue);
	return false;
}
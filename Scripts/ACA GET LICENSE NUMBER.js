var useAppSpecificGroupName = false;
var cap = aa.env.getValue("CapModel");

try {
	var parentCapId = null;
	parentCapIdString = "" + cap.getParentCapID();
	if (parentCapIdString) {
		pca = parentCapIdString .split("-");
		parentCapId = aa.cap.getCapID(pca[0],pca[1],pca[2]).getOutput();
	}

	if (parentCapId) {
		editAppSpecific4ACA("Parent Record ID",parentCapId.getCustomID());
		aa.env.setValue("CapModel",cap);
	}	
} catch (err) {
	aa.debug("**ERROR" + err,"**ERROR" + err);
}

	
function editAppSpecific4ACA(itemName, itemValue) {

    var i = cap.getAppSpecificInfoGroups().iterator();

    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
                    field.setChecklistComment(itemValue);
                }
            }
        }
    }
}
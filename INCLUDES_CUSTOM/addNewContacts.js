function addNewContacts() {
parentid = getParent();
if (parentid) {
	contactlist = getContactArray();
	parentcontactlist = getContactArray(parentid);
	contactSeqList = new Array();
	parentContactSeqList = new Array();
	for (x in contactlist) contactSeqList[contactlist[x]["businessName"]] = contactlist[x]["contactType"];
	for (x in parentcontactlist) parentContactSeqList[parentcontactlist[x]["businessName"]] = parentcontactlist[x]["contactType"];
	for (x in contactSeqList) if (!parentContactSeqList[x]) copyContacts(capId, getParent());
	}
}
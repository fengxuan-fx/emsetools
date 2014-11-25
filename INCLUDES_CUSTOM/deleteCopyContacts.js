function deleteCopyContacts(pFromCapId, pToCapId) {
//Copies all contacts from pFromCapId to pToCapId
//
// like original but delete all existing contacts before copy
if (pToCapId == null)
var vToCapId = capId;
else
var vToCapId = pToCapId;
//FA 12-20-2010 Dont remove any contacts


var capContactResult = aa.people.getCapContactByCapID(pToCapId);
if (capContactResult.getSuccess()) {
var Contacts = capContactResult.getOutput();
for (yy in Contacts) {
var con = Contacts[yy];
//if (con.getCapContactModel().getPeople().getContactType() == "Application Contact") {
logDebug("Contact Type=" + con.getCapContactModel().getPeople().getContactType());
var capContactId = con.getPeople().getContactSeqNumber();
delResult = aa.people.removeCapContact(pToCapId, capContactId);
if (!delResult.getSuccess()) {
logDebug("Error removing contacts on target Cap " + delResult.getErrorMessage());
}
//}
}
}


var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
var copied = 0;
if (capContactResult.getSuccess()) {
var Contacts = capContactResult.getOutput();
for (yy in Contacts) {
var newContact = Contacts[yy].getCapContactModel();
// Copy only the Application Contanct
//if (Contacts[yy].getCapContactModel().getPeople().getContactType() == "Application Contact") {
newContact.setCapID(vToCapId);
//aa.people.createCapContact(newContact);
aa.people.createCapContactWithAttribute(newContact);
copied++;
logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
//}
}
}
else {
logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
return false;
}
return copied;
}
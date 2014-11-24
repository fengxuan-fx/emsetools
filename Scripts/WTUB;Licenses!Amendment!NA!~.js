var gp = getParent();
var status = aa.cap.getCap(gp).getOutput().getCapStatus(); //aa.cap.getAppStatus(gp);

if(wfTask =="Amendment Review" && wfStatus =="Approved" && status =="Issued"){
showMessage = true;
	cancel = true;
	comment("You cannot approve a contact amendment change once an application has been issued.");
	}
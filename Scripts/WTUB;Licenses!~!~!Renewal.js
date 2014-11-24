if (wfTask == "Application Review" && wfStatus == "Complete" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Application Review" && wfStatus == "Completed" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}
//Comment Out Non License Unit Block for Unpaid Fee
/*
if (wfTask == "Milk Industry Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Plant Industry Review" && wfStatus == "Complete" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}

if (wfTask == "Final Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}
*/
if (wfTask == "Amendment Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}
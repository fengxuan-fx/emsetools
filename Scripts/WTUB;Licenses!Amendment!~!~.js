
/* Comment Out non License Unit Condition Blocks
if (wfTask =="Plant Industry Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");

	}
	
i
	
	
*/
if(appMatch("Licenses/Amendment/Tonnage Report/Fertilizer"))
{
if (wfTask == "Amendment Review" && wfStatus == "Approved" && balanceDue > 0) {
	cancel = true;
	showMessage = true;
	comment("Cannot complete Application Review until application fees are paid in full.");
}
}
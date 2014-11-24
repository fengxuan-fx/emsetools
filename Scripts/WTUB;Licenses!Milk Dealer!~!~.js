logDebug("Milk Dealer Cap ID" + capId);

/* Comment out Non License Unit Condition Blocks
if (wfTask =="Milk Industry Review" && wfStatus == "Approved" && appHasCondition(null,"Applied",null,"Required")) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
*/


/*
//var assignStaff = fTask.getTaskItem().getAssignedUser();
var assignStaff = aa.person.getUser(fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName()).getOutput();


var currUser = aa.person.getCurrentUser();
var personObj = currUser.getOutput();
var fName = personObj.getFirstName();
var mName = personObj.getMiddleName();
var lName = personObj.getLastName();

if(assignStaff != (fName + mName + lName)) {
showMessage = true;
	cancel = true;
	comment("You cannot update a task for someone else");
	}
	else {
	showMessage = true;
	cancel = true;
	comment("This is the right person");
	}

logDebug("User ID" + fName + mName + lName);
logDebug("Staff" + assignStaff); 
*/

		
			
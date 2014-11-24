//Test comment
var conditionSev = aa.env.getValue("ConditionSeverity");
var conditionStat = aa.env.getValue("ConditionStatus");
var conditionComment = aa.env.getValue("ConditionComment");

//Test comment 2
if (conditionStat == "Applied" && conditionSev == "") {
	cancel = true;
	showMessage = false;
	comment("You Must Enter A Severity for this Condition");
	}
	
if (conditionComment == "This contact has noted that they have been convicted of a felony.Must be released before application review can be completed." && conditionSev != "Required") {
	cancel = true;
	showMessage = true;
	comment("Felony Condition must be added with a severity of Required");
	}
	



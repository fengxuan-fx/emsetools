
var conditionSev = aa.env.getValue("ConditionSeverity");
var conditionStat = aa.env.getValue("ConditionStatus");

if (conditionStat == "Applied" && conditionSev == "") {
	cancel = true;
	showMessage = true;
	comment("You Must Enter A Severity for this Condition");
	}
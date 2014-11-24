if (wfTask =="Application Review" && wfStatus == "Complete" && appHasCondition(null,"Applied",null,null)) {
	showMessage = true;
	cancel = true;
	comment("There are Conditions on the record that have not been released.");
	}
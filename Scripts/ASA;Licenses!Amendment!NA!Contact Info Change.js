if (!publicUser) {
	updateAppStatus("Received","");
	include("CTRCA:Licenses/Amendment/NA/Contact Info Change");
	loadASITables();
	//link up the amendment to all the parents
	if (typeof(AMEND) == "object") {  // table of records to process
		for (var i in AMEND) {
			if (String(AMEND[i]["Change this Record?"]).substring(0,1).toUpperCase() == "Y") {
				addParent(AMEND[i]["Record ID"]);			
			}
		}
	}
}
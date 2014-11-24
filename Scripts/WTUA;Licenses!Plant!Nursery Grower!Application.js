if (wfTask=="Application Review" && wfStatus=="Complete") {
	scheduleInspection( "Nursery Grower",7);
	}

if (wfTask=="Inspection" && wfStatus=="License Not Required") {
	closeTask("Closure","Closed","Updated via script","");
	}

if (wfTask=="Inspection" && wfStatus=="Wrong Application Type") {
	closeTask("Closure","Closed","Updated via script","");
	}
function copyContactsForAmmonium(srcCapId, targetCapId) {
    //1. Get people with source CAPID.
    var capPeoples = getPeople(targetCapId);
    if (capPeoples == null || capPeoples.length == 0) {
        return;
    }
	var i = 1;
    
    for (loopk in capPeoples) {
        sourcePeopleModel = capPeoples[loopk];
        //3.1 Set target CAPID to source people.
        
		
	
        //3.3 It is a matched people model.
        if (sourcePeopleModel != null) {
            //3.3.1 Copy information from source to target.
           
			
			if (sourcePeopleModel.getCapContactModel().getPeople().getContactType() == "Facility Location") {
                var arrAtt = sourcePeopleModel.getCapContactModel().getPeople().getAttributes().toArray();
                // logDebug("arrAtt.leng:" + arrAtt.length + " capId:" + capId.getCustomID());

                for (xx in arrAtt) {
                    if (arrAtt[xx].getAttributeName() == "LICENSE #" && arrAtt[xx].getAttributeValue() == null) {
                        peop = sourcePeopleModel.getPeople();

                        //get contact attributes 
                        var attrs = peop.getAttributes();

                        if (attrs) {
                            var ai = attrs.iterator();
                            while (ai.hasNext()) {
                                var xx = ai.next(); // xx is a CapContactAttributeModel
                                //logDebug("xx=" + xx.getAttributeName() + "-- Value=" + xx.getAttributeValue());
                                // update license number
                                if (xx.getAttributeName().toUpperCase() == "LICENSE #") {
                                    xx.setAttributeValue(targetCapId.getCustomID() + "-" + (i));
									i++;
                                }
                            }
                            //set attributes
                            peop.setAttributes(attrs);
                            
                            sourcePeopleModel.getCapContactModel().setPeople(peop);
                            editResult = aa.people.editCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
                            if (editResult.getSuccess()) {
                                logDebug("Edited the contact successfully");
                            } else {
                                logDebug("Error updating CAP contact " + editResult.getErrorMessage());
                            }

                        }
                    }
                }
            }
		}
	}
}
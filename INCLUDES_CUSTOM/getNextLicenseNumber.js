function getNextLicenseNumber(srcCapId, pcapId, licNum) {

	
    var capContactResult = aa.people.getCapContactByCapID(pcapId);
	var peop = null;
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
		var i = 1;
        for (yy = 0; yy < Contacts.length; yy++) {

            var con = Contacts[yy];
            if (con.getCapContactModel().getPeople().getContactType() == "Additional Location") {
                var arrAtt = Contacts[yy].getPeople().getAttributes().toArray();
                // logDebug("arrAtt.leng:" + arrAtt.length + " capId:" + capId.getCustomID());

                for (xx in arrAtt) {
                    if (arrAtt[xx].getAttributeName() == "LICENSE #" && arrAtt[xx].getAttributeValue() == null) {
                        peop = con.getPeople();

                        //get contact attributes 
                        var attrs = peop.getAttributes();

                        if (attrs) {
                            var ai = attrs.iterator();
                            while (ai.hasNext()) {
                                var xx = ai.next(); // xx is a CapContactAttributeModel
                                //logDebug("xx=" + xx.getAttributeName() + "-- Value=" + xx.getAttributeValue());
                                // update license number
                                if (xx.getAttributeName().toUpperCase() == "LICENSE #") {
                                    xx.setAttributeValue(licNum + "-" + (i));
									i++;
                                }
                            }
                            //set attributes
                            peop.setAttributes(attrs);
                            //con.setPeople();
							
                            con.getCapContactModel().setPeople(peop);
                            editResult = aa.people.editCapContactWithAttribute(con.getCapContactModel());
                            if (editResult.getSuccess()) {
                                logDebug("Edited contact successfully");
                            } else {
                                logDebug("Error updating CAP contact " + editResult.getErrorMessage());
                            }

                        }
                    }
                }
            }
        }
    }
	
	//copyContactAddressForAdditionalLocation("Additional Location", srcCapId, pcapId);
}
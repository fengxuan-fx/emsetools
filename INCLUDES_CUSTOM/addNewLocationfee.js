function addNewLocationfee() {

    var contType = "Additional Location";
    var amendLocCnt = 0;
    var LicsLocCnt = 0;

    appTypeResult = cap.getCapType();   //create CapTypeModel object
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");

    if (appTypeArray[1].toUpperCase().equals("AMENDMENT")) { // || appTypeArray[3].toUpperCase().equals("RENEWAL")
        var conArray = getContactArray(capId);

        aa.print("Have the contactArray");

        for (thisCon in conArray) {
            toEmailAddress = null;
            b3Contact = conArray[thisCon];

            if (b3Contact["contactType"].toUpperCase().equals(contType.toUpperCase())) {
                amendLocCnt += 1;
                aa.print("exists(b3Contact[contactType]:" + b3Contact["contactType"]);
            }
        }


        var pCapID = getParent();

        var pConArray = getContactArray(pCapID);

        aa.print("Have the contactArray");

        for (thispCon in pConArray) {
            toEmailAddress = null;
            pB3Contact = pConArray[thispCon];

            if (pB3Contact["contactType"].toUpperCase().equals(contType.toUpperCase())) {
                LicsLocCnt += 1;
                aa.print("exists(b3Contact[contactType]:" + pB3Contact["contactType"]);
            }
        }
    }
    aa.print("amendLocCnt:" + amendLocCnt);
    aa.print("LicsLocCnt:" + LicsLocCnt);

    var diffLoc = amendLocCnt - LicsLocCnt;
    aa.print("diffLoc:" + diffLoc);

    if (diffLoc > 0) {
        var fcode = "PLNT_GRDL_01";
        var fsched = "PLNT_GRDLR";
        var fperiod = "FINAL";
        var fqty = diffLoc;
        var finvoice = "N";
        // addFee(thisFee.code, thisFee.sched, thisFee.period, thisFee.unit, "N", capId)
        addFee(fcode, fsched, fperiod, fqty, finvoice);
    }

}
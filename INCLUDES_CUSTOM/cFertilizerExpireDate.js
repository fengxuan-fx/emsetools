function cFertilizerExpireDate(pcapId) {
    //logDebug("Inside cFertilizerExpireDate");
    //logDebug("Parent ID: " +pcapId);
    b1ExpResult = aa.expiration.getLicensesByCapID(pcapId);
    if (b1ExpResult.getSuccess()) {

        var b1Exp = b1ExpResult.getOutput();
        //Get expiration details
        var expDate = b1Exp.getExpDate();
        if (expDate) {
            //logDebug("Previous expiraton date: " +expDate);
            var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
            var expYear = expDate.getYear();
            //aa.print("EXPPPP YEAR "+b1ExpDate);

            var newExpdate = new Date();
            newExpdate.setMonth(12);
            newExpdate.setDate(0);
            var yy=0;
            if((expYear%2)==0)
            {
                 yy = expYear + 2;

            }
            else
            {
                 yy=expYear + 1;
            }
            //logDebug("Expiration year: " + yy);
            newExpdate.setFullYear(yy);

            var edate = newExpdate.getMonth() + 1 + "/" + newExpdate.getDate() + "/" + newExpdate.getFullYear(); //Adding 1 to the getMonth method to get the Dece
            var expAADate = aa.date.parseDate(edate);
            b1Exp.setExpDate(expAADate);
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            //logDebug("Updated renewal to " + expAADate);

        }

    }

}
function waveLicenseFee() {

        var fcode = "";
        var fsched = "";
        var fqty = 0;
        var feeComment = "Waived Fee";

        //load the fees for current cap
        var feeA = loadFees(capId);

        for (x in feeA) {
            thisFee = feeA[x];
            logDebug("We have a fee " + thisFee.code + " status : " + thisFee.status + " sequence:" + thisFee.sequence);
            var feeSeq = thisFee.sequence;
            var fcode = thisFee.code;
            var editResult = aa.finance.editFeeItemUnit(capId, fqty,feeSeq);
            feeUpdated = true;
            if (editResult.getSuccess()) {
                logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);

                //get the fee item
                fsm = aa.finance.getFeeItemByPK(capId, feeSeq).getOutput().getF4FeeItem();

                //update note field
                fsm.setFeeNotes(feeComment);
                aa.finance.editFeeItem(fsm)

                logDebug("Updated Notes on Existing Fee Item: " + fcode + " to Notes: " + feeComment);

            }
        }
    
}
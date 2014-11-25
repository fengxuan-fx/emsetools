 function isAllProductInfoSame(tableValueArray1, tableValueArray2, capID, tableName) {

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(capID, tableName)

    if (!tssmResult.getSuccess())
    { aa.print("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage()); return false }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var fld_readonly = tsm.getReadonlyField(); // get Readonly field

    for (thisrow1 in tableValueArray1) {
    var col = tsm.getColumns()
        var coli = col.iterator();

        while (coli.hasNext()) {
            var colname = coli.next();
            val1 = tableValueArray1[thisrow1][colname.getColumnName()].fieldValue;
            val2 = tableValueArray2[thisrow1][colname.getColumnName()].fieldValue;
            val1Len = 0;
            val2Len = 0;

            if (isEmpty(val1) && isBlank(val1)) {
                val1Len = 0;
            } else {
                val1Len = val1.length();
            }
            
            if (isEmpty(val2) && isBlank(val2)){
                val2Len = 0;
            } else {
                val2Len = val2.length();
            }

            aa.print("1" + (isEmpty(val1) && isBlank(val1)));
            aa.print("2" + (isEmpty(val2) && isBlank(val2)));
            aa.print("val1:" + val1Len + " val2:" + val1Len);

            //if count is zero it might be null for both or one continue.
            if (val1Len == 0 && val1Len == 0) continue;

            if (val1==val2) {
                aa.print("EQUAL");
            } else {
                aa.print("NOT EQUAL");
                return false;
            }
        }
    }
    return true;

}
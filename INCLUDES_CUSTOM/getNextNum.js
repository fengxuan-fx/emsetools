function getNextNum(ta, tableName, sColName) {

    //ta = gm.getTablesArray()
    var tai = ta.iterator();
    var maxSFX = 0;

    while (tai.hasNext()) {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName();
        var tblName = tn;

        if (!tn.equals(tableName)) {
            continue;
        }
        aa.print("Table Name:" + tn);

        var numrows = 0;
        tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');

        if (!isNaN(tn.substring(0, 1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

        if (!tsm.rowIndex.isEmpty()) {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            var blnAdd = false;
            if (!tsm.rowIndex.isEmpty()) {
                var tsmfldi = tsm.getTableField().iterator();
                var tsmcoli = tsm.getColumns().iterator();
                var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
                var numrows = 1;

                while (tsmfldi.hasNext())  // cycle through fields
                {
                    if (!tsmcoli.hasNext())  // cycle through columns
                    {
                        var tsmcoli = tsm.getColumns().iterator();
                        tempArray.push(tempObject);  // end of record
                        var tempObject = new Array();  // clear the temp obj
                        numrows++;
                    }
                    var tcol = tsmcoli.next();
                    var tval = tsmfldi.next();

                    //add permit number
                    if (tcol.getColumnName().equals(sColName)) {
                        if (tval != null) {
                            if (tval.lastIndexOf("-") > 0) {
                                var strVal = tval.substr(tval.lastIndexOf("-") + 1);
                                aa.print("strVal: " + strVal);
                                if (parseInt(strVal) > parseInt(maxSFX)) {
                                    maxSFX = strVal;
                                }
                            }
                        }
                    }
                    var readOnly = 'N';
                    if (readOnlyi.hasNext()) {
                        readOnly = readOnlyi.next();
                    }

                    var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                    tempObject[tcol.getColumnName()] = fieldInfo;
                    //tempObject[tcol.getColumnName()] = tval;
                }

                tempArray.push(tempObject);  // end of record
            }
        }

        var copyStr = "" + tn + " = tempArray";
        eval(copyStr);  // move to table name
    }
    maxSFX++;
    return maxSFX;
}
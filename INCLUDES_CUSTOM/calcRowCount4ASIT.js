 function calcRowCount4ASIT(tableName) {

    var rowCount = 0;



    var appSpecificTableGroupModel = aa.appSpecificTableScript.getAppSpecificTableGroupModel(capId).getOutput();

    if (appSpecificTableGroupModel != null) {

        var tablesMap = appSpecificTableGroupModel.getTablesArray();

        if (tablesMap == null) return 0;

        var appSpecificTableModelArray = tablesMap.toArray();






        for (i in appSpecificTableModelArray) {

            var appSpecificTableModel = appSpecificTableModelArray[i];

            //aa.print("you are here" +appSpecificTableModel);

            if (!appSpecificTableModel.getTableName().equals(tableName)) continue;

            if (appSpecificTableModel == null || appSpecificTableModel.getColumns() == null || 

appSpecificTableModel.getTableField() == null) continue;

            var columnCount = appSpecificTableModel.getColumns().toArray().length;  // Columm Count

            var fieldCount = appSpecificTableModel.getTableField().toArray().length; // Field Count

            rowCount = fieldCount / columnCount;

            //aa.print(rowCount);

            break;

        }







    }

    return rowCount;

}


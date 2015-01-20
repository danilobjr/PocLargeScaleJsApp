function reorderableTableFactory() {
    var _table = undefined;
    var _redraw = true;
    var _factoryApi = {
        init: init
    };
    return _factoryApi;
    function init(dataTablesFactoryInstance) {
        _table = dataTablesFactoryInstance.dataTablesObject;
        registerSubscribers();
        sort();
        var _instanceApi = {
            moveRowUp: moveRowUp,
            moveRowDown: moveRowDown
        };
        return _instanceApi;
    }
    function registerSubscribers() {
        amplify.subscribe('table-rowRemoved', updateOrderNumbers);
        amplify.subscribe('table-rowReordered', sort);
        amplify.subscribe('table-rowReordered', paginate);
    }
    function moveRowUp(rowIndex) {
        var rowMetaData = getRowMetaData(rowIndex);
        var rowIsNotFirst = rowMetaData.row.order > 1;
        if (rowIsNotFirst) {
            changeRowOrder(rowMetaData.row).decrease();
            changeRowOrder(rowMetaData.previousRow).increase();
            amplify.publish('table-rowReordered', rowMetaData.row.order);
        }
    }
    function moveRowDown(rowIndex) {
        var rowMetaData = getRowMetaData(rowIndex);
        var rowIsNotLast = rowMetaData.row.order < _table.fnGetNodes().length;
        if (rowIsNotLast) {
            changeRowOrder(rowMetaData.row).increase();
            changeRowOrder(rowMetaData.nextRow).decrease();
            amplify.publish('table-rowReordered', rowMetaData.row.order);
        }
    }
    function changeRowOrder(row) {
        var _row = row;
        var _api = {
            decrease: up,
            increase: down
        };
        return _api;
        function up() {
            _row.order = _row.order - 1;
            updateRowOrder(_row.order, _row.index);
        }
        function down() {
            _row.order = _row.order + 1;
            updateRowOrder(_row.order, _row.index);
        }
    }
    function getRowMetaData(rowIndex) {
        var row = _table.fnGetData(rowIndex);
        row.order = parseInt(row[0], 10);
        row.index = rowIndex;
        var previousRow = findRowOrderBy(row.order - 1);
        var nextRow = findRowOrderBy(row.order + 1);
        return {
            row: row,
            previousRow: previousRow,
            nextRow: nextRow
        };
    }
    function findRowOrderBy(order) {
        var rowCollection = _table.fnGetNodes();
        var row = _.find(rowCollection, function (row) {
            var _thisRowOrder = parseInt($(row).find('td:first').text(), 10);
            return _thisRowOrder === order;
        });
        if (!row) {
            return undefined;
        }
        row.index = _table.fnGetPosition(row);
        row.order = order;
        return row;
    }
    function updateOrderNumbers() {
        var rows = _table.fnGetNodes();
        var sorted = _.sortBy(rows, function (row) {
            return parseInt($(row).find('td:first').text(), 10);
        });
        _.map(sorted, function (row, index) {
            var rowPosistion = _table.fnGetPosition(row);
            updateRowOrder(index + 1, rowPosistion);
        });
    }
    function updateRowOrder(newOrder, currentRowIndex) {
        var columnIndex = 0;
        var redraw = false;
        _table.fnUpdate(newOrder, currentRowIndex, columnIndex, redraw);
    }
    function sort() {
        _table.fnSort([[0, 'asc']]);
    }
    function paginate(order) {
        var page = -1;
        var pageNotDefined = true;
        var counterByTen = 1;
        while (pageNotDefined) {
            if (order >= counterByTen && order < (counterByTen + 10)) {
                pageNotDefined = false;
            }
            page++;
            counterByTen = counterByTen + 10;
        }
        _table.fnPageChange(page);
    }
}

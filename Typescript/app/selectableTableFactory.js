function selectableTableFactory() {
    var _table = undefined;
    var _factoryApi = {
        init: init
    };
    return _factoryApi;
    ///////////////////
    function init(dataTablesFactoryInstance) {
        _table = dataTablesFactoryInstance;
        registerEvents();
        registerSubscribers();
        var _instanceApi = {
            getSelectedRow: getSelectedRow,
            deselectAllRowsOnPage: deselectAllRowsOnPage
        };
        return _instanceApi;
    }
    function registerEvents() {
        var selector = _table.selector + ' tbody tr';
        $(document).on('click', selector, selectRow);
    }
    function registerSubscribers() {
        amplify.subscribe('table-rowAdded', deselectAllRowsOnPage);
    }
    function selectRow(event) {
        deselectAllRowsOnPage();
        var _this = $(event.currentTarget);
        _this.addClass('selected');
    }
    function deselectAllRowsOnPage() {
        $(_table.getNodes()).removeClass('selected');
        $('tbody tr.selected').removeClass('selected');
    }
    function getSelectedRow() {
        var rows = $(_table.getNodes());
        var selectedRow = rows.filter('tr.selected');
        var rowData = mapToRowData(selectedRow);
        if (rowData.length) {
            return {
                index: rows.index(selectedRow),
                data: rowData
            };
        }
        else {
            return undefined;
        }
    }
    function mapToRowData(selectedRow) {
        var rowCells = selectedRow.find('td');
        return $.map(rowCells, function (cell, key) {
            return $(cell).html();
        });
    }
}
//# sourceMappingURL=selectabletablefactory.js.map
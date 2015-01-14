function dataTablesFactory() {
    var _selector = 'table.datatables';
    var _config = {
        'bInfo': false,
        'bFilter': false,
        'bLengthChange': false
    };
    var _factoryApi = {
        selector: selector,
        setup: setup,
        init: init
    };
    return _factoryApi;
    function selector(jQuerySelector) {
        _selector = jQuerySelector;
        return _factoryApi;
    }
    function setup(config) {
        _config = $.extend({}, _config, config);
        return _factoryApi;
    }
    function init() {
        var tableElement = $(_selector);
        configureDataSortTypes(tableElement);
        var _table = tableElement.dataTable(_config);
        var _redraw = true;
        var _instanceApi = {
            addRow: addRow,
            removeRow: removeRow,
            getNodes: getNodes,
            dataTablesObject: _table,
            selector: _selector
        };
        return _instanceApi;
        function addRow(rowData, onAdd) {
            if (onAdd && $.isFunction(onAdd)) {
                var rows = getNodes();
                rowData = onAdd(rowData, rows);
            }
            var addedRow = _table.fnAddData(rowData, _redraw);
            amplify.publish('table-rowAdded');
            return addedRow;
        }
        function removeRow(row, callback) {
            var removedRow = _table.fnDeleteRow(row, callback, _redraw);
            amplify.publish('table-rowRemoved');
            return {
                data: convertRowToRawData(removedRow)
            };
        }
        function convertRowToRawData(row) {
            if (isDatatableRowObject(row)) {
                return row[0]._aData;
            }
            return row;
        }
        function isDatatableRowObject(row) {
            return $.isArray(row) && ($.isPlainObject(row[0]) && '_aData' in row[0]);
        }
        function getNodes() {
            return _table.fnGetNodes();
        }
    }
    function configureDataSortTypes(table) {
        var headers = table.find('thead th');
        if (existsSomeDataSortingTypeAttribute(headers)) {
            var sortingConfig = {
                aoColumns: []
            };
            headers.each(function (headerColumnIndex, element) {
                var sortingType = $(element).data().sortingType;
                var sSortDataType = (sortingType) ? { sSortDataType: sortingType } : null;
                sortingConfig.aoColumns.push(sSortDataType);
            });
            _config = mergeDefaultAoColumnsOptionsWithUserDefinedAoColumnsOptions(_config, sortingConfig);
        }
    }
    function existsSomeDataSortingTypeAttribute(headers) {
        return _.any(headers, function (th) {
            return !!$(th).data().sortingType;
        });
    }
    function mergeDefaultAoColumnsOptionsWithUserDefinedAoColumnsOptions(config, sortingConfig) {
        if (config.aoColumns && (config.aoColumns.length !== sortingConfig.aoColumns.length)) {
            console.error('DataTable Setup Error: "aoColumns" option do not match with number of columns');
            return;
        }
        for (var i = 0; i < sortingConfig.aoColumns.length; i++) {
            config.aoColumns[i] = $.extend({}, config.aoColumns[i], sortingConfig.aoColumns[i]);
        }
        ;
        return config;
    }
}

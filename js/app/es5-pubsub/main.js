// $(function () {
    'use strict';

    // function needsToBeImplementedIn(component) {
    //     return function () {
    //         throw new Error('This function needs to be implemented in ' + component);
    //     }
    // }

    function dataTablesFactory() {

        var _selector = 'table.datatables';
        var _config = {
            'bInfo': false,
            'bFilter': false,
            'bLengthChange': false
        };

        var _api = {
            selector: selector,
            setup: setup,
            instantiate: instantiate
        };

        return _api;

        ///////////

        function selector(jQuerySelector) {
            _selector = jQuerySelector;

            return _api;
        }

        function setup(config) {
            _config = $.extend({}, _config, config);

            return _api;
        }

        function instantiate () {
            var tableElement = $(_selector);

            configureDataSortTypes(tableElement);

            var _table = tableElement.dataTable(_config);
            var _redraw = true;

            var methods = {
                addRow: addRow,
                removeRow: removeRow,
                getNodes: getNodes,
                dataTablesObject: _table
            };

            return methods;

            ///////////////

            function addRow(rowData, onAdd) {

            	if (onAdd && $.isFunction(onAdd)) {
            		var rows = getNodes();
            		rowData = onAdd(rowData, rows);
            	}

                var addedRow = _table.fnAddData(rowData, _redraw);
                amplify.publish('table.rowAdded');
                return addedRow;
            }

            function removeRow(row, callback) {
                var removedRow = _table.fnDeleteRow(row, callback, _redraw);

                amplify.publish('table.rowRemoved');

                return {
                    data: convertRowToRawData(removedRow)
                };
            }

            function convertRowToRawData(row) {
                if (isDatatableRowObject(row)) { return row[0]._aData; }

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

            if (existsSomeDataSortingTypeAttribute()) {
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

        // aoColumns is an option of DataTables plugin
        function mergeDefaultAoColumnsOptionsWithUserDefinedAoColumnsOptions(config, sortingConfig) {
            if (config.aoColumns && (config.aoColumns.length !== sortingConfig.aoColumns.length)) {
                console.error('DataTable Setup Error: "aoColumns" option do not match with number of columns');
                return;
            }

            for (var i = 0; i < sortingConfig.aoColumns.length; i++) {
                config.aoColumns[i] = $.extend({}, config.aoColumns[i], sortingConfig.aoColumns[i]);
            };

            return config;
        }
    }

    function selectableTableFactory() {

        var factory = {
            init: init
        };

        return factory;

        function init(dataTablesObject) {

            var _table = dataTablesObject;

            init();

            var methods = {
                getSelectedRow: getSelectedRow,
                deselectAllRowsOnPage: deselectAllRowsOnPage
            };

            return methods;

            ///////////////

            function init() {
                bindEvents();
                registerSubscriptions();
            }

            function bindEvents() {
                var selector = _table.selector + ' tbody tr';
                $(document).on('click', selector, selectRow);
            }

            function registerSubscriptions() {
                amplify.subscribe('table.rowAdded', deselectAllRowsOnPage);
                amplify.subscribe('table.rowSelected', deselectAllRowsOnPage);
            }

            function selectRow(event) {
                amplify.publish('table.rowSelected');

                var _this = $(event.currentTarget);
                _this.addClass('selected');
            }

            function deselectAllRowsOnPage() {
                $(_table.fnGetNodes()).removeClass('selected');
                $('tbody tr.selected').removeClass('selected');
            }

            function getSelectedRow() {
                var rows = $(_table.fnGetNodes());
                var selectedRow = rows.filter('tr.selected');
                var rowData = mapToRowData(selectedRow);

                if (rowData.length) {
                    return {
                        index: rows.index(selectedRow),
                        data: rowData
                    };
                } else {
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
    }

    function reorderableTableFactory() {

        var factory = {
            init: init
        };

        return factory;

        function init(dataTablesObject) {

            var _table = dataTablesObject;
            var _redraw = true;

            init();

            var methods = {
                moveRowUp: moveRowUp,
                moveRowDown: moveRowDown
            };

            return methods;

            ///////////////

            function init() {
                registerSubscriptions();
                sort();
            }

            function registerSubscriptions() {
                amplify.subscribe('table.rowOrderUpdated', sort);
            }

            function sort() {
                _table.fnSort([[0,'asc']]);
            }

            function moveRowUp(row) {
                var rowMetaData = getRowMetaData(row);
                // var currentIndexOfRow = _table.fnGetPosition(row);
                // var newPosition = currentIndexOfRow - 1;

                var newPosition = rowMetaData.order - 1;
                var currentIndexOfRow = rowMetaData.index;
                var columnIndex = 1;

                _table.fnUpdate(newPosition,
                            currentIndexOfRow, // get row position in current model
                            columnIndex,
                            _redraw); // false = defer redraw until all row updates are done

                updateCurrentRow(rowMetaData);

                amplify.publish('table.rowOrderUpdated');
            }

            function moveRowDown(row) {
                amplify.publish('table.rowOrderUpdated');
            }

            function getRowMetaData(row) {
                var currentIndexOfRow = _table.fnGetPosition(row);
                var numericBase = 10;
                var order = parseInt($(row).find('td:first').text(), numericBase);

                return {
                    index: currentIndexOfRow,
                    order: order
                };
            }
        }
    }

    // (function validationMessages() {
    //     var _messageContainer = $('.validation-message');
    //     var _closeBtn = _messageContainer.find('.close');

    //     init();

    //     ///////

    //     function init() {
    //         bindEvents();
    //         subscribeToEvents();
    //     }

    //     function bindEvents() {
    //         _closeBtn.on('click', hideMessage);
    //     }

    //     function hideMessage() {
    //         _messageContainer.addClass('hidden');
    //     }

    //     function subscribeToEvents() {
    //         amplify.subscribe('validation.isValid', hideMessage);
    //         amplify.subscribe('validation.notValid', showMessage);
    //     }

    //     function showMessage(validationMessage) {
    //         _messageContainer
    //             .removeClass('hidden')
    //             .find('span').text(validationMessage);
    //     }
    // })();

    function formValidator(view) {

    	var _view = view;

        var api = {
            isValid: isValid
        };

        return api;

        ///////////

        function isValid() {
        	if (nameFieldIsEmpty()) { return false; }
            if (noneItemIsSelected()) { return false; }
            if (numberOfSelectedItemsExceeded50()) { return false; }

            amplify.publish('validation.isValid');
            return true;
        };

        function nameFieldIsEmpty() {
        	var nameFieldIsEmpty = !_view.form.getNameValue();

        	if (nameFieldIsEmpty) {
        		amplify.publish('validation.nameIsRequired');
        		return true;
        	}

        	return false;
        }

        function noneItemIsSelected() {
    		var noneItemIsSelected = _view.tables.selectedItems.getNodes().length == 0;

            if (noneItemIsSelected) {
            	amplify.publish('validation.mustHaveAtLeastOneItemSelected');
            	return true;
            }

            return false;
        }

        function numberOfSelectedItemsExceeded50() {
    		var numberOfSelectedItemsExceeded50 = _view.tables.selectedItems.getNodes().length > 50;

            if (numberOfSelectedItemsExceeded50) {
            	amplify.publish('validation.maximumNumberOfSelectedItemsIs50');
            	return true;
            }

            return false;
        }
    }

    function view(dataTablesFactory, selectableTableFactory, reorderableTableFactory) {

        var _form = $('form');
        var _nameField = $('input[name=name]');
        var _addItemBtn = $('#addItemBtn');
        var _removeItemBtn = $('#removeItemBtn');
        var _dataTablesFactory = dataTablesFactory;
        var _selectableTableFactory = selectableTableFactory;
        var _reorderableTableFactory = reorderableTableFactory;

        var api = {
            form: {
                onSubmit: onSubmit,
                getNameValue: getNameValue
            },
            tables: {
	            selectedItems: {},
	            existingItems: {},
            },
            sideBySideCommands: {
            	onAddItem: onAddItem,
            	onRemoveItem: onRemoveItem
            }
        };

        init();

        return api;

        ///////////

        function init() {
            setupTables();
        }

        function setupTables() {
            var tableSetup = {
                //"bPaginate": false,
                "sPaginationType": "full_numbers",
                "bLengthChange": false,
                "bFilter": false,
                "bSort": false,
                "bInfo": false,
                "bAutoWidth": false,
                //"sDom": "<\"table-header\"fl>t<\"table-footer\"ip>"
                "sDom": "t<\"table-footer client-side-pagination\"ip>"
            };

            var selectedItemsSetup = tableSetup;
                // $.extend(
                // {},
                // {
                //     "aoColumns": [
                //         { "bVisible": false },
                //         null
                //     ]
                // },
                // setup);

            api.tables.selectedItems = _dataTablesFactory()
                .selector('#selectedItems')
                .setup(selectedItemsSetup)
                .instantiate();

            api.tables.selectedItems = $.extend({},
                api.tables.selectedItems,
                selectableTableFactory().init(api.tables.selectedItems.dataTablesObject),
                reorderableTableFactory().init(api.tables.selectedItems.dataTablesObject));

            api.tables.existingItems = _dataTablesFactory()
                .selector('#existingItems')
                .setup(tableSetup)
                .instantiate();

            api.tables.existingItems = $.extend({},
                api.tables.existingItems,
                selectableTableFactory().init(api.tables.existingItems.dataTablesObject));
        }

        function onSubmit(submitFunction) {
        	_form.on('submit', submitFunction);
        }

        function onAddItem(addItemFunction) {
        	_addItemBtn.on('click', addItemFunction);
        }

        function onRemoveItem(removeItemFunction) {
        	_removeItemBtn.on('click', removeItemFunction);
        }

        // function isValid() {
        //     return _validator.isValid();
        // }

        function getNameValue() {
            return _nameField.val();
        }
    }

    function complexFormController(view, formValidator) {

        // var _form = $('form');
        // var _addItemBtn = $('#addItemBtn');
        // var _removeItemBtn = $('#removeItemBtn');
        // var _moveRowUpBtn = $('#moveRowUpBtn');
        var _view = view;
        var _formValidator = formValidator;

        var api = {
            submitForm: submitForm,
            addItem: addItem,
            removeItem: removeItem
        };

        init();

        return api;

        ///////////

        function init() {
        	_view.form.onSubmit(submitForm);
        	_view.sideBySideCommands.onAddItem(addItem);
        	_view.sideBySideCommands.onRemoveItem(removeItem);
        }

        function submitForm() {
            var isValid = _formValidator.isValid();

            if (!isValid) {
                return false;
            }
        }

        function addItem() {
            // var isValid = !_validator.numberOfSelectedItemsExceeded();

            // if (isValid) {

                var selectedRow = _view.tables.existingItems.getSelectedRow();

                if (selectedRow) {
                    var removedRow = _view.tables.existingItems.removeRow(selectedRow.index);
                    _view.tables.selectedItems.addRow(removedRow.data, onAddRowToSelectedItemsTable);
                }
            // }
        }

        function onAddRowToSelectedItemsTable(rowData, rows) {
        	var order = rows.length + 1;
        	rowData.unshift(order);

        	return rowData;
        }

        function removeItem() {
            var selectedRow = _view.tables.selectedItems.getSelectedRow();

            if (selectedRow) {
                var removedRow = _view.tables.selectedItems.removeRow(selectedRow.index);
                _view.tables.existingItems.addRow(removedRow.data, onAddRowToExistingItemsTable);
            }
        }

        function onAddRowToExistingItemsTable(rowData) {
        	rowData.shift();

        	return rowData;
        }

        // function formIsValid() {
        // 	return _validator.isValid();
        // }

        // init();

        ///////

        // function init() {
        //     setupTables();
        //     setupValidator();
        //     bindEvents();
        // }

        // function setupTables() {
        //     var setup = {
        //         //"bPaginate": false,
        //         "sPaginationType": "full_numbers",
        //         "bLengthChange": false,
        //         "bFilter": false,
        //         "bSort": false,
        //         "bInfo": false,
        //         "bAutoWidth": false,
        //         //"sDom": "<\"table-header\"fl>t<\"table-footer\"ip>"
        //         "sDom": "t<\"table-footer client-side-pagination\"ip>"
        //     };

        //     var selectedItemsSetup = setup;
        //         // $.extend(
        //         // {},
        //         // {
        //         //     "aoColumns": [
        //         //         { "bVisible": false },
        //         //         null
        //         //     ]
        //         // },
        //         // setup);

        //     _selectedItems = dataTablesFactory()
        //         .selector('#selectedItems')
        //         .setup(selectedItemsSetup)
        //         .instantiate();

        //     _selectedItems = $.extend({},
        //         _selectedItems,
        //         selectableTableFactory().init(_selectedItems.dataTablesObject),
        //         reorderableTableFactory().init(_selectedItems.dataTablesObject));

        //     _existingItems = dataTablesFactory()
        //         .selector('#existingItems')
        //         .setup(setup)
        //         .instantiate();

        //     _existingItems = $.extend({},
        //         _existingItems,
        //         selectableTableFactory().init(_existingItems.dataTablesObject));
        // }

        // function setupValidator() {
        //     _validator = complexFormValidator().init(_selectedItems);
        // }

        // function bindEvents() {
        //     _form.on('submit', submitForm);
        //     _addItemBtn.on('click', addItem);
        //     _removeItemBtn.on('click', removeItem);
        //     _moveRowUpBtn.on('click', moveSelectedRowUp);
        // }

        // function submitForm() {
        //     var formIsValid = _validator.isValid();

        //     if (!formIsValid) {
        //         return false;
        //     }
        // }

        // function moveSelectedRowUp() {
        //     var selectedRow = _selectedItems.getSelectedRow();

        //     if (selectedRow) {
        //         _selectedItems.moveRowUp(selectedRow);
        //     }
        // }

    }
// });

$(function () {
	'use strict';

	var _view = view(dataTablesFactory, selectableTableFactory, reorderableTableFactory);
    var _validator = formValidator(_view);
    complexFormController(_view, _validator);
});

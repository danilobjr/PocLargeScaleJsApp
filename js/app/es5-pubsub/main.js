// $(function () {
    'use strict';

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

        ///////////////////

        function selector(jQuerySelector) {
            _selector = jQuerySelector;

            return _factoryApi;
        }

        function setup(config) {
            _config = $.extend({}, _config, config);

            return _factoryApi;
        }

        function init () {
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

            ////////////////////

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

    function reorderableTableFactory() {

    	var _table = undefined;
        var _redraw = true;

        var _factoryApi = {
            init: init
        };

        return _factoryApi;

        ///////////////////

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
                // sort();
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

            ////////////

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

            var row = _.find(rowCollection, function(row) {
                var _thisRowOrder = parseInt($(row).find('td:first').text(), 10);
                return _thisRowOrder === order;
            });

            if (!row) { return undefined; }

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

            _table.fnUpdate(newOrder,
                            currentRowIndex,
                            columnIndex,
                            redraw);
        }

        function sort() {
            _table.fnSort([[0,'asc']]);
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

    function formValidator(view) {

        var _view = view;

        var api = {
            isValid: isValid,
            numberOfSelectedItemsIsGraterThanOrEqual50: numberOfSelectedItemsIsGraterThanOrEqual50
        };

        return api;

        ///////////

        function isValid() {
        	if (nameFieldIsEmpty()) { return false; }
            if (noneItemIsSelected()) { return false; }
            if (numberOfSelectedItemsIsGraterThanOrEqual50()) { return false; }

            amplify.publish('validation-isValid');

            return true;
        };

        function nameFieldIsEmpty() {
        	var nameFieldIsEmpty = !_view.getNameFieldValue();

        	if (nameFieldIsEmpty) {
        		amplify.publish('validation-nameIsRequired');
        		return true;
        	}

        	return false;
        }

        function noneItemIsSelected() {
    		var noneItemIsSelected = _view.tables.selectedItems.getNodes().length == 0;

            if (noneItemIsSelected) {
            	amplify.publish('validation-mustHaveAtLeastOneItemSelected');
            	return true;
            }

            return false;
        }

        function numberOfSelectedItemsIsGraterThanOrEqual50() {
    		var numberOfSelectedItemsIsGraterThanOrEqual50 = _view.tables.selectedItems.getNodes().length >= 50;

            if (numberOfSelectedItemsIsGraterThanOrEqual50) {
            	amplify.publish('validation-maximumNumberOfSelectedItemsIs50');
            	return true;
            }

            return false;
        }
    }

    function validationMessagesController(view) {

    	var _view = view;

        init();

        var api = {
        	showMessage: showMessage,
        	hideMessage: hideMessage
        };

        return api;

        ///////////

        function init() {
            registerEvents();
        }

        function registerEvents() {
        	_view.validationMessage.onDismiss(hideMessage);
        }

        function hideMessage() {
            _view.validationMessage.hide();
        }

        function showMessage(topic) {
            hideMessage();
            _view.validationMessage.showElementById(topic);
        }
    }

    function view(dataTablesFactory, selectableTableFactory, reorderableTableFactory) {

        var _form = $('form');
        var _nameField = $('input[name=name]');
        var _addItemBtn = $('#addItemBtn');
        var _removeItemBtn = $('#removeItemBtn');
        var _moveRowUpBtn = $('#moveRowUpBtn');
        var _moveRowDownBtn = $('#moveRowDownBtn');
        var _validationMessageContainer = $('.validation-message-container');
        var _closeBtn = _validationMessageContainer.find('.close');
        var _dataTablesFactory = dataTablesFactory;
        var _selectableTableFactory = selectableTableFactory;
        var _reorderableTableFactory = reorderableTableFactory;

        var _api = {
            form: {
                onSubmit: onSubmit,
            },
            getNameFieldValue: getNameFieldValue,
            tables: {
	            selectedItems: {},
	            existingItems: {},
            },
            sideBySideCommands: {
            	onAddItem: onAddItem,
            	onRemoveItem: onRemoveItem,
            	onMoveRowUp: onMoveRowUp,
            	onMoveRowDown: onMoveRowDown
            },
            validationMessage: {
                showElementById: showElementById,
                hide: hideAllValidationElements,
            	onDismiss: onDismissValidationMessage
            }
        };

        init();

        return _api;

        ////////////

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

            var selectedItemsTable = _dataTablesFactory()
                .selector('#selectedItems')
                .setup(selectedItemsSetup)
                .init();

            _api.tables.selectedItems = $.extend({},
                selectedItemsTable,
                selectableTableFactory().init(selectedItemsTable),
                reorderableTableFactory().init(selectedItemsTable));

            var existingItemsTable = _dataTablesFactory()
                .selector('#existingItems')
                .setup(tableSetup)
                .init();

            _api.tables.existingItems = $.extend({},
                existingItemsTable,
                selectableTableFactory().init(existingItemsTable));
        }

        function getNameFieldValue() {
            return _nameField.val();
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

        function onDismissValidationMessage(dismissFunction) {
            _closeBtn.on('click', dismissFunction);
        }

        function onMoveRowUp(moveRowUpFunction) {
        	_moveRowUpBtn.on('click', moveRowUpFunction);
        }

        function onMoveRowDown(moveRowDownFunction) {
        	_moveRowDownBtn.on('click', moveRowDownFunction);
        }

        function showElementById(elementId) {
            var validationMessageSelector = '#' + elementId;
            _validationMessageContainer.removeClass('hidden');
            _validationMessageContainer.find(validationMessageSelector).removeClass('hidden');
        }

        function hideAllValidationElements() {
            _validationMessageContainer.addClass('hidden');
            _validationMessageContainer.find('.alert').addClass('hidden');
        }
    }

    function complexFormController(view, formValidator, validationMessagesController) {

        var _view = view;
        var _formValidator = formValidator;
        var _validationMessagesController = validationMessagesController;

        var api = {
            submitForm: submitForm,
            addItem: addItem,
            removeItem: removeItem,
            showNameRequiredValidationMessage: showNameRequiredValidationMessage,
            showMustHaveAtLeastOneItemSelectedValidationMessage: showMustHaveAtLeastOneItemSelectedValidationMessage,
            showMaximumNumberOfSelectedItemsIs50ValidationMessage: showMaximumNumberOfSelectedItemsIs50ValidationMessage,
            hideValidationMessage: hideValidationMessage,
            registerSubscribers: registerSubscribers,
            unsubscribeAllTopics: unsubscribeAllTopics
        };

        init();

        return api;

        ///////////

        function init() {
        	registerEvents();
        	registerSubscribers();
        }

        function registerEvents() {
        	_view.form.onSubmit(submitForm);
        	_view.sideBySideCommands.onAddItem(addItem);
        	_view.sideBySideCommands.onRemoveItem(removeItem);
        	_view.sideBySideCommands.onMoveRowUp(moveRowUp);
        	_view.sideBySideCommands.onMoveRowDown(moveRowDown);
        }

        function registerSubscribers() {
            amplify.subscribe('validation-isValid', hideValidationMessage);
            amplify.subscribe('validation-nameIsRequired', showNameRequiredValidationMessage);
            amplify.subscribe('validation-mustHaveAtLeastOneItemSelected', showMustHaveAtLeastOneItemSelectedValidationMessage);
            amplify.subscribe('validation-maximumNumberOfSelectedItemsIs50', showMaximumNumberOfSelectedItemsIs50ValidationMessage);

        }

        function unsubscribeAllTopics() {
        	amplify.unsubscribe('validation-isValid', hideValidationMessage);
    		amplify.unsubscribe('validation-nameIsRequired', showNameRequiredValidationMessage);
    		amplify.unsubscribe('validation-mustHaveAtLeastOneItemSelected', showMustHaveAtLeastOneItemSelectedValidationMessage);
    		amplify.unsubscribe('validation-maximumNumberOfSelectedItemsIs50', showMaximumNumberOfSelectedItemsIs50ValidationMessage);
        }

        function submitForm() {
            var isValid = _formValidator.isValid();

            if (!isValid) {
                return false;
            }
        }

        function addItem() {
            var selectedItemsTableIsItsMaximumCapacity = _formValidator.numberOfSelectedItemsIsGraterThanOrEqual50();

            if (!selectedItemsTableIsItsMaximumCapacity) {
                var selectedRow = _view.tables.existingItems.getSelectedRow();

                if (selectedRow) {
                    var removedRow = _view.tables.existingItems.removeRow(selectedRow.index);
                    _view.tables.selectedItems.addRow(removedRow.data, onAddRowToSelectedItemsTable);
                }
            }
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

        function moveRowUp() {
        	var selectedRow = _view.tables.selectedItems.getSelectedRow();

        	if (selectedRow) {
        		_view.tables.selectedItems.moveRowUp(selectedRow.index);
        	}
        }

        function moveRowDown() {
        	var selectedRow = _view.tables.selectedItems.getSelectedRow();

        	if (selectedRow) {
        		_view.tables.selectedItems.moveRowDown(selectedRow.index);
        	}
        }

        function showNameRequiredValidationMessage() {
        	showValidationMessageFor('validation-nameIsRequired');
        }

        function showMustHaveAtLeastOneItemSelectedValidationMessage() {
        	showValidationMessageFor('validation-mustHaveAtLeastOneItemSelected');
        }

        function showMaximumNumberOfSelectedItemsIs50ValidationMessage() {
        	showValidationMessageFor('validation-maximumNumberOfSelectedItemsIs50');
        }

        function showValidationMessageFor(topic) {
        	_validationMessagesController.showMessage(topic);
        }

        function hideValidationMessage() {
        	_validationMessagesController.hideMessage();
        }
    }
// });
